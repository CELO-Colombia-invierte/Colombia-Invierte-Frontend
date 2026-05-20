import React from 'react';
import { GovernanceAction, ACTION_LABELS } from '@/services/governance.service';
import type { ProposalFormState } from './types';

interface Props {
  form: ProposalFormState;
  setForm: (f: ProposalFormState) => void;
  projectCreator: string | null;
  busy: string | null;
  onSubmit: () => void;
}

export const ProposalForm: React.FC<Props> = ({ form, setForm, projectCreator, busy, onSubmit }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 8,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, marginBottom: 4 };

  const showAmount = form.action === GovernanceAction.Disbursement;
  const showTargetId =
    form.action === GovernanceAction.FreezeFromDispute ||
    form.action === GovernanceAction.ApproveAndExecuteMilestone ||
    form.action === GovernanceAction.CancelMilestone;
  const showRawNumber =
    form.action === GovernanceAction.UpdateQuorum || form.action === GovernanceAction.UpdateVotingPeriod;

  const targetIdLabel =
    form.action === GovernanceAction.FreezeFromDispute
      ? 'ID de la disputa'
      : 'ID del hito';

  return (
    <div className="governance-item" style={{ marginBottom: 16 }}>
      <h4 style={{ margin: '0 0 12px' }}>Crear propuesta on-chain</h4>

      <label style={labelStyle}>Tipo de acción</label>
      <select
        value={form.action}
        onChange={(e) => setForm({ ...form, action: Number(e.target.value) })}
        style={inputStyle}
      >
        <option value={GovernanceAction.Disbursement}>{ACTION_LABELS[GovernanceAction.Disbursement]}</option>
        <option value={GovernanceAction.ApproveAndExecuteMilestone}>{ACTION_LABELS[GovernanceAction.ApproveAndExecuteMilestone]}</option>
        <option value={GovernanceAction.CancelMilestone}>{ACTION_LABELS[GovernanceAction.CancelMilestone]}</option>
        <option value={GovernanceAction.FreezeFromDispute}>{ACTION_LABELS[GovernanceAction.FreezeFromDispute]}</option>
        <option value={GovernanceAction.UnfreezeVault}>{ACTION_LABELS[GovernanceAction.UnfreezeVault]}</option>
        <option value={GovernanceAction.ActivateVault}>{ACTION_LABELS[GovernanceAction.ActivateVault]}</option>
        <option value={GovernanceAction.CloseVault}>{ACTION_LABELS[GovernanceAction.CloseVault]}</option>
        <option value={GovernanceAction.UpdateQuorum}>{ACTION_LABELS[GovernanceAction.UpdateQuorum]}</option>
        <option value={GovernanceAction.UpdateVotingPeriod}>{ACTION_LABELS[GovernanceAction.UpdateVotingPeriod]}</option>
      </select>

      {showAmount && (
        <>
          <label style={labelStyle}>Monto en USDC</label>
          <input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={inputStyle}
          />
        </>
      )}

      {form.action === GovernanceAction.Disbursement && projectCreator && (
        <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
          Los fondos se enviarán al host del proyecto:{' '}
          <code>
            {projectCreator.slice(0, 6)}…{projectCreator.slice(-4)}
          </code>
        </p>
      )}

      {showTargetId && (
        <>
          <label style={labelStyle}>{targetIdLabel}</label>
          <input
            type="number"
            placeholder="1"
            value={form.targetId}
            onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            style={inputStyle}
          />
        </>
      )}

      {showRawNumber && (
        <>
          <label style={labelStyle}>
            {form.action === GovernanceAction.UpdateQuorum ? 'Nuevo % de quórum (1–100)' : 'Nuevo período en segundos'}
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={inputStyle}
          />
        </>
      )}

      <label style={labelStyle}>Descripción</label>
      <textarea
        placeholder="Por qué se solicita..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        style={inputStyle}
      />

      <button className="invest-btn" onClick={onSubmit} disabled={busy === 'create' || !form.description}>
        {busy === 'create' ? 'Enviando...' : 'Crear propuesta'}
      </button>
    </div>
  );
};
