import React, { useState } from 'react';
import { useIonToast } from '@ionic/react';
import { useActiveAccount } from 'thirdweb/react';
import { useReturnYield } from '../hooks/use-return-yield';
import { propuestasService } from '@/services/propuestas/propuestas.service';

interface Props {
  propuestaId: string;
  natilleraAddress: string;
  vaultAddress: string;
  onSuccess: () => void | Promise<void>;
}

export const ReturnYieldForm: React.FC<Props> = ({
  propuestaId,
  natilleraAddress,
  vaultAddress,
  onSuccess,
}) => {
  const account = useActiveAccount();
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { returnYield, isSending } = useReturnYield();
  const [present] = useIonToast();

  const handleSubmit = async () => {
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      await present({ message: 'Ingresa un monto válido', duration: 2000, color: 'warning' });
      return;
    }
    if (!account) {
      await present({ message: 'Conecta tu wallet', duration: 2000, color: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const source = account.address;
      const receipt = await returnYield(natilleraAddress, vaultAddress, amountNum, source);
      await propuestasService.returnYield(propuestaId, amountNum, source, receipt.txHash);
      await present({ message: 'Ganancias devueltas al pool', duration: 2500, color: 'success' });
      await onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al devolver ganancias';
      await present({ message: msg, duration: 3000, color: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || isSending;

  return (
    <div className="return-yield-form">
      <h4>Devolver capital + ganancia al pool</h4>
      <p>
        Indica el monto total en USDC (capital original + ganancia) que devuelves al pool de la
        Natillera.
      </p>
      <div className="return-yield-input">
        <label>Monto total (USDC)</label>
        <input
          type="number"
          step="0.000001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ej: 150.00"
          disabled={busy}
        />
      </div>
      <button className="return-yield-submit" onClick={handleSubmit} disabled={busy || !amount}>
        {isSending ? 'Firmando...' : submitting ? 'Procesando...' : 'Devolver al pool'}
      </button>
    </div>
  );
};
