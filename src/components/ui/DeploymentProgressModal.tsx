import React from 'react';
import './DeploymentProgressModal.css';

export interface DeploymentStep {
  label: string;
}

interface DeploymentProgressModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  steps: DeploymentStep[];
  /** 1-based index of the in-progress step. 0 = hidden / not started; > steps.length = all done. */
  currentStep: number;
}

const StepIcon: React.FC<{ status: 'done' | 'active' | 'pending' }> = ({ status }) => {
  if (status === 'done') {
    return (
      <div className="dpm-step-icon dpm-step-icon--done">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="#3b82f6" />
          <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="dpm-step-icon dpm-step-icon--active">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="32" strokeDashoffset="8" />
        </svg>
      </div>
    );
  }
  return (
    <div className="dpm-step-icon dpm-step-icon--pending">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="2" />
        <polyline points="12 7 12 12 15 14" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const DeploymentProgressModal: React.FC<DeploymentProgressModalProps> = ({
  visible,
  title,
  subtitle,
  steps,
  currentStep,
}) => {
  if (!visible) return null;

  return (
    <div className="dpm-overlay">
      <div
        className="dpm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dpm-title"
        aria-describedby="dpm-subtitle"
      >
        <div className="dpm-header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="#3b82f6" />
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
            <polyline points="12 7 12 12 15 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 id="dpm-title" className="dpm-title">{title}</h2>

        <div className="dpm-steps" aria-live="polite">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const status =
              stepNumber < currentStep ? 'done' :
              stepNumber === currentStep ? 'active' :
              'pending';
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className="dpm-step-row">
                <div className="dpm-step-left">
                  <StepIcon status={status} />
                  {!isLast && <div className={`dpm-step-line ${stepNumber < currentStep ? 'dpm-step-line--done' : ''}`} />}
                </div>
                <p className={`dpm-step-label ${status === 'pending' ? 'dpm-step-label--pending' : ''}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        <p id="dpm-subtitle" className="dpm-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};
