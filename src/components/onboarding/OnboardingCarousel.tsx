import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import './OnboardingCarousel.css';

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Ahorro en Grupo, Como Siempre... Pero Más Seguro',
    description:
      'Todos aportan al fondo común y el dinero se va sumando de forma ordenada. El grupo puede ver cómo crece el ahorro sin depender de una sola persona.',
    image: '/assets/images/onboarding/01-ahorro-grupo.png',
  },
  {
    id: 2,
    title: 'Todo Claro, Todo a la Vista',
    description:
      'Desde el celular podés ver tus aportes, los movimientos del fondo y cómo va el progreso, sin cuentas enredadas ni dudas.',
    image: '/assets/images/onboarding/02-todo-claro.png',
  },
  {
    id: 3,
    title: 'Nunca Estás Solo para Entenderlo',
    description:
      'Un asistente te ayuda a usar la plataforma y resolver dudas. Y cuando lo necesites, también hay personas capacitadas listas para acompañarte y ayudarte paso a paso.',
    image: '/assets/images/onboarding/03-nunca-solo.png',
  },
  {
    id: 4,
    title: 'El Dinero Se Usa Solo Como Se Acordó',
    description:
      'El fondo está protegido por reglas claras aceptadas por todos. Nadie puede sacar o mover el dinero sin que el grupo esté de acuerdo.',
    image: '/assets/images/onboarding/04-dinero-acordado.png',
  },
  {
    id: 5,
    title: 'El Fondo Bien Cuidado, Siempre',
    description:
      'Los aportes quedan resguardados hasta que llegue el momento correcto de usarlos, sin riesgos ni manejos personales.',
    image: '/assets/images/onboarding/05-fondo-cuidado.png',
  },
  {
    id: 6,
    title: 'Premios y Beneficios por Participar',
    description:
      'Vamos a premiar a los usuarios y potenciar algunas natilleras y proyectos que usen la plataforma de forma activa.',
    image: '/assets/images/onboarding/06-premios-beneficios.png',
  },
  {
    id: 7,
    title: 'Cuando Hay Ganancias, Son Para Todos',
    description:
      'Si el fondo genera beneficios, el sistema los reparte de forma justa según lo que aportó y cumplió cada persona.',
    image: '/assets/images/onboarding/07-ganancias-todos.png',
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
              <h2 className="onboarding-title">
                {slides[currentSlide].title}
              </h2>
              <p className="onboarding-description">
                {slides[currentSlide].description}
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

              {currentSlide < slides.length - 1 ? (
                <button
                  onClick={nextSlide}
                  className="onboarding-nav-button onboarding-nav-button-right"
                  aria-label="Siguiente"
                >
                  <IonIcon icon={chevronForward} />
                </button>
              ) : (
                <IonButton
                  fill="solid"
                  onClick={handleComplete}
                  className="onboarding-complete-button"
                >
                  Comenzar
                </IonButton>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

