import { useState } from 'react';
import type { Account } from 'thirdweb/wallets';
import { projectsService } from '@/services/projects';
import { apiService } from '@/services/api/api.service';
import { blockchainService } from '@/services/blockchain.service';
import { BLOCKCHAIN_CONFIG } from '@/contracts/config';
import {
  Project,
  ProjectType,
  Currency,
  ProjectVisibility,
} from '@/models/projects';
import type { TokenizacionFormData, TokenRightDto, TokenFaqDto } from './types';

const MIN_GAS = BigInt('50000000000000000');

async function ensureGas(account: Account): Promise<boolean> {
  try {
    await apiService.post('/blockchain/fund-gas', { address: account.address });
    let retries = 5;
    let balance = await blockchainService.getNativeBalance(account.address);
    while (balance < MIN_GAS && retries > 0) {
      await new Promise((r) => setTimeout(r, 3000));
      balance = await blockchainService.getNativeBalance(account.address);
      retries--;
    }
    if (balance < MIN_GAS) {
      throw new Error('El backend envió gas pero no impactó en la blockchain a tiempo.');
    }
    return true;
  } catch {
    const balance = await blockchainService.getNativeBalance(account.address);
    return balance >= MIN_GAS;
  }
}

function buildProjectPayload(
  formData: TokenizacionFormData,
  tokenRights: TokenRightDto[],
  tokenFaqs: TokenFaqDto[],
) {
  const valorActivo = parseFloat(formData.valorActivo);
  const rendimiento = parseFloat(formData.rendimiento);
  const precioPorToken = parseFloat(formData.precioPorToken);
  const totalTokens = parseInt(formData.totalTokens);

  const ventaAnticipada = formData.ventaAnticipada === 'true';
  let presaleStartsAt: string | undefined;
  let publicSaleStartsAt: string | undefined;

  if (ventaAnticipada && formData.fechaVentaAnticipada && formData.fechaVentaPublica) {
    presaleStartsAt = new Date(`${formData.fechaVentaAnticipada}T${formData.horaVentaAnticipada}`).toISOString();
    publicSaleStartsAt = new Date(`${formData.fechaVentaPublica}T${formData.horaVentaPublica}`).toISOString();
  }

  const rightsFiltered = tokenRights.filter((r) => r.title.trim() !== '');
  const faqsFiltered = tokenFaqs.filter((f) => f.question.trim() !== '' && f.answer.trim() !== '');

  return {
    payload: {
      type: ProjectType.TOKENIZATION,
      name: formData.nombreProyecto,
      description_rich: formData.descripcion,
      highlights_rich: formData.aspectosDestacados,
      visibility: formData.privacidad as ProjectVisibility,
      tokenization_details: {
        asset_value_amount: valorActivo,
        asset_value_currency: formData.moneda as Currency,
        expected_annual_return_pct: rendimiento,
        price_per_token_amount: precioPorToken,
        price_per_token_currency: formData.monedaToken as Currency,
        total_tokens: totalTokens,
        token_symbol: formData.simboloToken,
        token_name: formData.nombreToken,
        ...(ventaAnticipada && presaleStartsAt && publicSaleStartsAt && {
          presale_enabled: true,
          presale_starts_at: presaleStartsAt,
          public_sale_starts_at: publicSaleStartsAt,
        }),
      },
      token_rights: rightsFiltered.map((r) => ({ title: r.title, description: r.title })),
      token_faqs: faqsFiltered.map((f) => ({ question: f.question, answer: f.answer })),
    },
    numbers: { valorActivo, precioPorToken },
  };
}

const copToUsdc = (cop: number): bigint =>
  blockchainService.parseUnits(
    (cop / BLOCKCHAIN_CONFIG.COP_TO_USDT_RATE).toFixed(BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS),
    BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_DECIMALS,
  );

export interface DeployResult {
  ok: boolean;
  project?: Project;
  error?: { message: string; isGasError: boolean };
}

export function useTokenizacionDeploy() {
  const [deployStep, setDeployStep] = useState(0);

  const run = async (
    account: Account,
    formData: TokenizacionFormData,
    tokenRights: TokenRightDto[],
    tokenFaqs: TokenFaqDto[],
    selectedImage: File | null,
    selectedDocuments: { id: string; file?: File; motivo: string }[],
  ): Promise<DeployResult> => {
    let currentProjectId: string | null = null;
    try {
      setDeployStep(1);
      const hasGas = await ensureGas(account);
      if (!hasGas) {
        setDeployStep(0);
        return { ok: false, error: { message: 'Sin saldo para gas. Reinicia la app o contacta al soporte.', isGasError: true } };
      }

      const { payload, numbers } = buildProjectPayload(formData, tokenRights, tokenFaqs);
      const project = await projectsService.create(payload);
      currentProjectId = project.id;

      if (selectedImage) {
        await projectsService.uploadImage(project.id, selectedImage, true, 'Miniatura de tokenizacion');
      }

      for (const doc of selectedDocuments.filter((d) => d.file)) {
        await projectsService.uploadDocument(project.id, doc.file!, doc.motivo || doc.file!.name, 'GENERAL', doc.motivo);
      }

      setDeployStep(2);
      const tokenPrice = copToUsdc(numbers.precioPorToken);
      const totalTokens = BigInt(parseInt(formData.totalTokens, 10));
      const fundingTarget = tokenPrice * totalTokens;
      const halfTokens = totalTokens / 2n;
      const minimumCap = tokenPrice * (halfTokens > 0n ? halfTokens : 1n);
      const addresses = await blockchainService.deployTokenizacionV2(account, {
        settlementToken: BLOCKCHAIN_CONFIG.PAYMENT_TOKEN_ADDRESS,
        fundingTarget,
        minimumCap,
        tokenPrice,
        saleDuration: BigInt(30 * 24 * 60 * 60),
        name: formData.nombreToken || formData.nombreProyecto,
        symbol: formData.simboloToken || 'TKN',
      });

      setDeployStep(3);
      const published = await projectsService.registerV2Contract(project.id, addresses);

      setDeployStep(4);
      await new Promise((r) => setTimeout(r, 600));
      setDeployStep(0);

      return { ok: true, project: published };
    } catch (error: any) {
      setDeployStep(0);
      if (currentProjectId) {
        try {
          await projectsService.delete(currentProjectId);
        } catch {
        }
      }
      const msg: string = error?.message ?? '';
      const isGasError =
        msg.includes('insufficient funds') ||
        msg.includes('error_forwarding_sequencer') ||
        msg.includes('gas');
      return { ok: false, error: { message: msg || 'Error al crear la tokenización', isGasError } };
    }
  };

  return { deployStep, run };
}
