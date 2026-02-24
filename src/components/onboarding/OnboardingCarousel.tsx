import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonIcon,
} from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import './OnboardingCarousel.css';

interface OnboardingSlide {
  id: number;
  title: string;
  description: React.ReactNode;
  image: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Ahorro en Grupo Más Seguro',
    description: (
      <>
        Todos aportan, el dinero <strong>crece</strong>, sin líos. El dinero se
        mueve cuando el grupo lo <strong>aprueba</strong>.
      </>
    ),
    image: '/assets/images/onboarding/05-fondo-cuidado.png',
  },
  {
    id: 2,
    title: 'Todo Claro y a la Vista',
    description: (
      <>
        <strong>Ves todo</strong> en tiempo real desde tu celular.{' '}
        <strong>Transparencia total</strong>, sin dudas ni cuentas enredadas.
      </>
    ),
    image: '/assets/images/onboarding/02-todo-claro.png',
  },
  {
    id: 3,
    title: 'Nunca Estás Solo',
    description: (
      <>
        Te <strong>guiamos</strong> paso a paso. Siempre hay ayuda cuando la{' '}
        <strong>necesitas</strong>.
      </>
    ),
    image: '/assets/images/onboarding/03-nunca-solo.png',
  },
  {
    id: 4,
    title: 'Premios y Ganancias para Todos',
    description: (
      <>
        Grupos activos <strong>reciben premios</strong>. Las ganancias se
        reparten de manera <strong>justa</strong>.
      </>
    ),
    image: '/assets/images/onboarding/06-premios-beneficios.png',
  },
];

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);

    const checkImageStatus = () => {
      if (imgRef.current) {
        const img = imgRef.current;

        if (img.complete && img.naturalHeight !== 0) {
          setImageLoading(false);
          setImageError(false);
        } else if (img.complete && img.naturalHeight === 0) {
          setImageLoading(false);
          setImageError(true);
        }
      }
    };

    const timeoutId = setTimeout(checkImageStatus, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <IonPage>
      <IonContent fullscreen className="onboarding-content">
        <div className="onboarding-container">
          <div className="onboarding-slide">
            <div className="onboarding-image-container">
              <img
                ref={imgRef}
                key={`slide-${currentSlide}-${currentSlideData.image}`}
                src={currentSlideData.image}
                alt={currentSlideData.title}
                className="onboarding-image"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoading || imageError ? 'none' : 'block' }}
              />
              {imageError && (
                <div className="onboarding-image-placeholder">
                  <p>Imagen: {currentSlideData.title}</p>
                </div>
              )}
              {imageLoading && !imageError && (
                <div className="onboarding-image-loading">
                  <p>Cargando...</p>
                </div>
              )}
            </div>

            <div className="onboarding-text-container">
              <h2 className="onboarding-title">{currentSlideData.title}</h2>
              <p className="onboarding-description">
                {currentSlideData.description}
              </p>
            </div>

            <div className="onboarding-navigation">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`onboarding-nav-button onboarding-nav-button-left ${
                  currentSlide === 0 ? 'disabled' : ''
                }`}
                aria-label="Anterior"
              >
                <IonIcon icon={chevronBack} />
              </button>

              <div className="onboarding-dots">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`onboarding-dot ${
                      index === currentSlide ? 'active' : ''
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Ir a slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="onboarding-nav-button onboarding-nav-button-right"
                aria-label="Siguiente"
              >
                <IonIcon icon={chevronForward} />
              </button>
            </div>

            <div className="onboarding-bottom-action">
              <button className="onboarding-skip-button" onClick={handleComplete}>
                {isLastSlide ? 'Comenzar' : 'Omitir'}
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
