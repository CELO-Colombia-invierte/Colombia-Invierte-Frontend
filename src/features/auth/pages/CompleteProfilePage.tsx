import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useAuth } from '@/hooks/use-auth';
import { isValidEmail } from '@/utils/validation';
import {
  isValidUsername,
  isValidDisplayName,
  isProfileComplete,
} from '@/utils/profile';
import type { CompleteProfileDto } from '@/dtos/auth/AuthResponse.dto';
import './CompleteProfilePage.css';

export const CompleteProfilePage: React.FC = () => {
  const history = useHistory();
  const { user, updateMe, isLoading, isAuthenticated } = useAuth();

  const [errors, setErrors] = useState<Partial<CompleteProfileDto>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof CompleteProfileDto, boolean>>
  >({});
  const [formData, setFormData] = useState<CompleteProfileDto>({
    display_name: user?.displayName || '',
    username: user?.username || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/auth');
      return;
    }

    if (user && isProfileComplete(user)) {
      history.replace('/home');
    }
  }, [isAuthenticated, user, history]);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const validateField = (
    field: keyof CompleteProfileDto,
    value: string
  ): string => {
    switch (field) {
      case 'display_name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2)
          return 'El nombre debe tener al menos 2 caracteres';
        if (value.trim().length > 50)
          return 'El nombre no puede exceder 50 caracteres';
        if (!isValidDisplayName(value))
          return 'El nombre debe tener entre 2 y 50 caracteres';
        return '';
      case 'username':
        if (!value.trim()) return 'El nombre de usuario es requerido';
        if (value.trim().length < 3)
          return 'El usuario debe tener al menos 3 caracteres';
        if (value.trim().length > 20)
          return 'El usuario no puede exceder 20 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return 'Solo se permiten letras, números y guiones bajos (_)';
        if (!isValidUsername(value))
          return 'Usuario inválido (3-20 caracteres, solo letras, números y _)';
        return '';
      case 'email':
        if (!value.trim()) return 'El email es requerido';
        if (!isValidEmail(value)) return 'Ingresa un email válido';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (
    field: keyof CompleteProfileDto,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof CompleteProfileDto) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CompleteProfileDto> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof CompleteProfileDto>).forEach(
      (field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    );

    setErrors(newErrors);
    setTouched({
      display_name: true,
      username: true,
      email: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateMe({
        display_name: formData.display_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      history.replace('/home');
    } catch (error: any) {
      console.error('Error updating profile:', error);

      if (error?.response?.data?.message) {
        const message = error.response.data.message;
        if (message.toLowerCase().includes('username')) {
          setErrors((prev) => ({ ...prev, username: message }));
          setTouched((prev) => ({ ...prev, username: true }));
        } else if (message.toLowerCase().includes('email')) {
          setErrors((prev) => ({ ...prev, email: message }));
          setTouched((prev) => ({ ...prev, email: true }));
        }
      }
    }
  };

  const isFormValid =
    !errors.display_name &&
    !errors.username &&
    !errors.email &&
    formData.display_name.trim() &&
    formData.username.trim() &&
    formData.email.trim();

  if (!isAuthenticated || !user) {
    return (
      <IonPage>
        <IonContent>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
            }}
          >
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="complete-profile-page">
        <div className="complete-profile-container">
          <div className="complete-profile-header">
            <div className="complete-profile-icon">👤</div>
            <h1 className="complete-profile-title">Completa tu perfil</h1>
            <p className="complete-profile-subtitle">
              Para comenzar, necesitamos algunos datos adicionales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="complete-profile-form">
            <div className="form-group">
              <label htmlFor="display_name" className="form-label">
                Nombre completo
              </label>
              <input
                id="display_name"
                type="text"
                value={formData.display_name}
                onChange={(e) =>
                  handleInputChange('display_name', e.target.value)
                }
                onBlur={() => handleBlur('display_name')}
                placeholder="Ej: Juan Pérez"
                className={`form-input ${errors.display_name && touched.display_name ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.display_name && touched.display_name && (
                <span className="error-text">{errors.display_name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                placeholder="Ej: juanperez"
                className={`form-input ${errors.username && touched.username ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.username && touched.username ? (
                <span className="error-text">{errors.username}</span>
              ) : (
                <span className="hint-text">
                  3-20 caracteres, solo letras, números y guión bajo (_)
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="Ej: juan@ejemplo.com"
                className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? <IonSpinner name="crescent" /> : 'Continuar'}
            </button>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CompleteProfilePage;
