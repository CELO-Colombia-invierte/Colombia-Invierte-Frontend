import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BottomSlideModal.css';

export interface ModalOption {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface BottomSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ModalOption[];
  title?: string;
}

export const BottomSlideModal: React.FC<BottomSlideModalProps> = ({
  isOpen,
  onClose,
  options,
  title = 'Selecciona una opción',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.div
            className="bottom-slide-modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
          >
            <div className="modal-handle-container">
              <div className="modal-handle" />
            </div>

            {title && (
              <div className="modal-header">
                <h3 className="modal-title">{title}</h3>
              </div>
            )}

            <div className="modal-options">
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  className="modal-option"
                  onClick={() => {
                    option.onClick();
                    onClose();
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.icon && (
                    <div className="option-icon">{option.icon}</div>
                  )}
                  <div className="option-content">
                    <h4 className="option-title">{option.title}</h4>
                    {option.description && (
                      <p className="option-description">{option.description}</p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
