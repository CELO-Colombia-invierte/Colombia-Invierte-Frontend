import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
    arrowBackOutline,
    cameraOutline,
    personOutline,
    calendarOutline,
    maleFemaleOutline,
    atOutline,
    trendingUpOutline,
    briefcaseOutline,
    ribbonOutline,
    timeOutline,
    shieldCheckmarkOutline,
    chevronDownOutline,
} from 'ionicons/icons';
import { useAuth } from '@/hooks/use-auth';
import { avatarService } from '@/services/users/avatar.service';
import { AvatarUploadModal } from '../components/AvatarUploadModal';
import type { UpdateUserRequestDto } from '@/dtos/auth/AuthResponse.dto';
import './EditProfilePage.css';
import {
    AVAILABLE_CATEGORIES,
    EMPLOYMENT_OPTIONS,
    EXPERTISE_OPTIONS,
    GENDER_OPTIONS,
    INTEREST_OPTIONS,
    INVESTMENT_EXPERIENCE_OPTIONS,
    RISK_OPTIONS,
    TIMELINE_OPTIONS,
} from '../constants/profile-options';

interface FormData {
    display_name: string;
    username: string;
    phone: string;
    phone_country_code: string;
    date_of_birth: string;
    gender: string;
    investment_experience: string;
    employment_status: string;
    investment_expertise: string;
    investment_timeline: string;
    risk_tolerance: string;
    active_interests: string;
}

const EditProfilePage: React.FC = () => {
    const history = useHistory();
    const { user, updateMe, isLoading, getMe } = useAuth();
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [formData, setFormData] = useState<FormData>({
        display_name: '',
        username: '',
        phone: '',
        phone_country_code: '+57',
        date_of_birth: '',
        gender: '',
        investment_experience: '',
        employment_status: '',
        investment_expertise: '',
        investment_timeline: '',
        risk_tolerance: '',
        active_interests: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                display_name: user.displayName || '',
                username: user.username || '',
                phone: user.phone || '',
                phone_country_code: user.phoneCountryCode || '+57',
                date_of_birth: user.dateOfBirth || '',
                gender: user.gender || '',
                investment_experience: user.investmentExperience || '',
                employment_status: user.employmentStatus || '',
                investment_expertise: user.investmentExpertise || '',
                investment_timeline: user.investmentTimeline || '',
                risk_tolerance: user.riskTolerance || '',
                active_interests: user.activeInterests?.join(', ') || '',
            });
            setSelectedCategories(user.favoriteCategories || []);
            setAvatarPreview(user.getAvatarUrl());
        }
    }, [user]);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleAvatarUpload = async (file: File) => {
        try {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setShowAvatarModal(false);

            const updatedUser = await avatarService.uploadAvatar(file);
            setAvatarPreview(updatedUser.getAvatarUrl());
            await getMe();
            showToast('Foto de perfil actualizada');
        } catch (error) {
            console.error('Error subiendo avatar:', error);
            setAvatarPreview(user?.getAvatarUrl());
            showToast('Error al subir la foto');
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const updateData: UpdateUserRequestDto = {
                display_name: formData.display_name.trim() || undefined,
                username: formData.username.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                phone_country_code: formData.phone_country_code || undefined,
                date_of_birth: formData.date_of_birth || undefined,
                gender: formData.gender || undefined,
                investment_experience: formData.investment_experience || undefined,
                employment_status: formData.employment_status || undefined,
                investment_expertise: formData.investment_expertise || undefined,
                investment_timeline: formData.investment_timeline || undefined,
                risk_tolerance: formData.risk_tolerance || undefined,
                favorite_categories:
                    selectedCategories.length > 0 ? selectedCategories : undefined,
                active_interests: formData.active_interests
                    ? formData.active_interests.split(',').map((s) => s.trim()).filter(Boolean)
                    : undefined,
            };

            await updateMe(updateData);
            showToast('Perfil actualizado exitosamente');
            setTimeout(() => history.goBack(), 1000);
        } catch (error: any) {
            console.error('Error actualizando perfil:', error);
            const msg = error?.message || 'Error al actualizar el perfil';
            showToast(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (
        icon: string,
        placeholder: string,
        field: keyof FormData,
        type: string = 'text'
    ) => (
        <div className="edit-profile-field">
            <IonIcon icon={icon} className="edit-profile-field-icon" />
            <input
                type={type}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                disabled={isSubmitting}
            />
        </div>
    );

    const renderSelect = (
        icon: string,
        field: keyof FormData,
        options: { value: string; label: string }[]
    ) => (
        <div className="edit-profile-field">
            <IonIcon icon={icon} className="edit-profile-field-icon" />
            <select
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                disabled={isSubmitting}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <IonIcon icon={chevronDownOutline} className="dropdown-arrow" />
        </div>
    );

    return (
        <IonPage>
            <IonContent fullscreen className="edit-profile-page">
                <div className="edit-profile-header">
                    <button
                        className="edit-profile-back-btn"
                        onClick={() => history.goBack()}
                        type="button"
                    >
                        <IonIcon icon={arrowBackOutline} />
                    </button>
                    <h1 className="edit-profile-title">Editar perfil</h1>
                </div>
                <div className="edit-profile-avatar-section">
                    <div
                        className="edit-profile-avatar-wrapper"
                        onClick={() => setShowAvatarModal(true)}
                    >
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar"
                                className="edit-profile-avatar"
                            />
                        ) : (
                            <div className="edit-profile-avatar-placeholder">
                                {(user?.getDisplayName() || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="edit-profile-camera-badge">
                            <IonIcon icon={cameraOutline} />
                        </div>
                    </div>
                    <p className="edit-profile-user-id">
                        ID: {user?.id?.substring(0, 12) || '---'}
                    </p>
                </div>
                <div className="edit-profile-form">
                    <div className="edit-profile-section">
                        <h2 className="edit-profile-section-title">General</h2>
                        {renderField(personOutline, 'Nombre completo', 'display_name')}
                        <div className="edit-profile-field">
                            <span className="edit-profile-field-flag">🇨🇴</span>
                            <span className="edit-profile-field-code">
                                {formData.phone_country_code}
                            </span>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="312-456-7890"
                                disabled={isSubmitting}
                            />
                        </div>

                        {renderField(
                            calendarOutline,
                            'DD / MM / AAAA',
                            'date_of_birth',
                            'date'
                        )}
                        {renderSelect(maleFemaleOutline, 'gender', GENDER_OPTIONS)}
                        {renderField(atOutline, 'Username', 'username')}
                    </div>
                    <div className="edit-profile-section">
                        <h2 className="edit-profile-section-title">Situación financiera</h2>
                        {renderSelect(
                            trendingUpOutline,
                            'investment_experience',
                            INVESTMENT_EXPERIENCE_OPTIONS
                        )}
                        {renderSelect(
                            briefcaseOutline,
                            'employment_status',
                            EMPLOYMENT_OPTIONS
                        )}
                        {renderSelect(
                            ribbonOutline,
                            'investment_expertise',
                            EXPERTISE_OPTIONS
                        )}
                        {renderSelect(
                            timeOutline,
                            'investment_timeline',
                            TIMELINE_OPTIONS
                        )}
                        {renderSelect(
                            shieldCheckmarkOutline,
                            'risk_tolerance',
                            RISK_OPTIONS
                        )}
                    </div>
                    <div className="edit-profile-section">
                        <div className="edit-profile-categories">
                            <p className="edit-profile-categories-label">
                                Seleccione 3 categorías que le interesen.
                            </p>
                            <div className="edit-profile-tags">
                                {AVAILABLE_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`edit-profile-tag ${selectedCategories.includes(cat) ? 'active' : ''
                                            }`}
                                        onClick={() => toggleCategory(cat)}
                                        disabled={isSubmitting}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="edit-profile-section">
                        {renderSelect(
                            trendingUpOutline,
                            'active_interests',
                            INTEREST_OPTIONS
                        )}
                    </div>
                </div>
                <div className="edit-profile-submit-wrapper">
                    <button
                        className="edit-profile-submit-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoading}
                        type="button"
                    >
                        {isSubmitting ? (
                            <IonSpinner name="crescent" />
                        ) : (
                            'Actualizar'
                        )}
                    </button>
                </div>
                {toast && <div className="edit-profile-toast">{toast}</div>}
                <AvatarUploadModal
                    isOpen={showAvatarModal}
                    onClose={() => setShowAvatarModal(false)}
                    onSelectFile={handleAvatarUpload}
                />
            </IonContent>
        </IonPage>
    );
};

export default EditProfilePage;
