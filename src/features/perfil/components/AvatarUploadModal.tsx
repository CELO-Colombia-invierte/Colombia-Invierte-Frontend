import React, { useRef } from 'react';
import './AvatarUploadModal.css';

interface AvatarUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFile: (file: File) => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
    isOpen,
    onClose,
    onSelectFile,
}) => {
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSelectFile(file);
        }
        e.target.value = '';
    };

    return (
        <div className="avatar-modal-backdrop" onClick={onClose}>
            <div
                className="avatar-modal-sheet"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="avatar-modal-close"
                    onClick={onClose}
                    type="button"
                >
                    ✕
                </button>

                <h3 className="avatar-modal-title">Editar foto perfil</h3>

                <button
                    className="avatar-modal-btn avatar-modal-btn-primary"
                    onClick={() => galleryInputRef.current?.click()}
                    type="button"
                >
                    Galería
                </button>

                <button
                    className="avatar-modal-btn avatar-modal-btn-outline"
                    onClick={() => cameraInputRef.current?.click()}
                    type="button"
                >
                    Abrir cámara
                </button>
                <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};
