import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import {
  natilleraService,
  natilleraMembershipService,
} from '@/services/natillera';

const JoinNatilleraPage: React.FC = () => {
  const history = useHistory();
  const { slug } = useParams<{ slug: string }>();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [natillera, setNatillera] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [joined, setJoined] = useState(false);
  const [joinResponse, setJoinResponse] = useState<any>(null);

  useEffect(() => {
    loadNatillera();
  }, [slug]);

  const loadNatillera = async () => {
    try {
      setLoading(true);
      console.log(slug, 3232);
      const data = await natilleraService.findOne(slug);
      setNatillera(data);
    } catch (error: any) {
      setError(error.message || 'No se pudo cargar la natillera');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      setJoining(true);
      const response = await natilleraMembershipService.join(natillera.id);
      setJoinResponse(response);
      setJoined(true);

      if (response.position?.status === 'PENDING') {
        await present({
          message: `Solicitud enviada. El anfitrión debe aprobar tu ingreso a "${natillera.name}"`,
          duration: 4000,
          color: 'warning',
        });
      } else {
        await present({
          message: `Te uniste exitosamente a la natillera "${natillera.name}"`,
          duration: 3000,
          color: 'success',
        });
      }
    } catch (error: any) {
      await present({
        message: error.message || 'Error al unirse a la natillera',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setJoining(false);
    }
  };

  const handleGoToNatillera = () => {
    if (natillera?.id) {
      history.push(`/natillera/${natillera.id}`);
    } else {
      history.push('/portafolio');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner name="crescent" />
            <p>Cargando natillera...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '30%' }}>
            <IonIcon
              icon={alertCircleOutline}
              style={{ fontSize: '80px', color: '#eb445a' }}
            />
            <h2>Error</h2>
            <p>{error}</p>
            <IonButton onClick={() => history.push('/portafolio')}>
              Ir al Portafolio
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (joined) {
    const isPending = joinResponse?.status === 'PENDING';

    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '30%' }}>
            <IonIcon
              icon={isPending ? alertCircleOutline : checkmarkCircleOutline}
              style={{
                fontSize: '80px',
                color: isPending ? '#ffc409' : '#2dd36f',
              }}
            />
            <h2>
              {isPending ? 'Solicitud Enviada' : '¡Te uniste exitosamente!'}
            </h2>
            <p style={{ fontSize: '18px', margin: '20px 0' }}>
              {isPending
                ? 'Tu solicitud está pendiente de aprobación por el anfitrión:'
                : 'Ahora eres parte de la natillera:'}
            </p>
            <h3 style={{ color: '#3880ff' }}>"{natillera?.name}"</h3>
            <p style={{ color: '#666', margin: '20px 0' }}>
              Creada por: {natillera?.owner_user?.username || 'Usuario'}
            </p>
            {isPending && (
              <p
                style={{
                  color: '#ffc409',
                  fontSize: '14px',
                  marginTop: '20px',
                }}
              >
                Te notificaremos cuando el anfitrión apruebe tu solicitud
              </p>
            )}
            <IonButton
              expand="block"
              onClick={handleGoToNatillera}
              style={{ maxWidth: '400px', margin: '20px auto' }}
            >
              {isPending ? 'Volver' : 'Ver Natillera'}
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div
          style={{
            maxWidth: '600px',
            margin: '50px auto',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
            Invitación a Natillera
          </h1>

          <div
            style={{
              background: '#f5f5f5',
              padding: '30px',
              borderRadius: '12px',
              margin: '30px 0',
            }}
          >
            <h2 style={{ color: '#3880ff', marginBottom: '15px' }}>
              {natillera?.name}
            </h2>

            {natillera?.description_rich && (
              <p style={{ color: '#666', marginBottom: '20px' }}>
                {natillera.description_rich}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                margin: '20px 0',
                flexWrap: 'wrap',
                gap: '15px',
              }}
            >
              <div>
                <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
                  Cuota Mensual
                </p>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '5px 0',
                  }}
                >
                  {natillera?.natillera_details?.monthly_fee_currency}{' '}
                  {natillera?.natillera_details?.monthly_fee_amount?.toLocaleString()}
                </p>
              </div>

              <div>
                <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
                  Duración
                </p>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '5px 0',
                  }}
                >
                  {natillera?.natillera_details?.duration_months} meses
                </p>
              </div>

              <div>
                <p style={{ color: '#999', fontSize: '14px', margin: '0' }}>
                  Rendimiento
                </p>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '5px 0',
                  }}
                >
                  {natillera?.natillera_details?.expected_annual_return_pct}%
                </p>
              </div>
            </div>

            <p style={{ color: '#666', marginTop: '20px' }}>
              Creada por:{' '}
              <strong>{natillera?.owner_user?.username || 'Usuario'}</strong>
            </p>
          </div>

          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            ¿Deseas unirte a esta natillera?
          </p>

          <div
            style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}
          >
            <IonButton
              color="light"
              onClick={() => history.push('/portafolio')}
              disabled={joining}
            >
              Cancelar
            </IonButton>
            <IonButton onClick={handleJoin} disabled={joining}>
              {joining ? (
                <>
                  <IonSpinner name="crescent" style={{ marginRight: '10px' }} />
                  Uniéndome...
                </>
              ) : (
                'Unirme a la Natillera'
              )}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default JoinNatilleraPage;
