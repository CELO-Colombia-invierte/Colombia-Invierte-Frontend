import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { checkmarkCircle } from 'ionicons/icons';
import { usersService } from '@/services/users';
import { projectsService } from '@/services/projects';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@/models/User.model';
import { Project } from '@/models/projects';
import { ProfileHeader, ProfileStats } from '../components';
import { PortfolioGrid } from '@/components/portfolio';
import { PortfolioProject } from '@/types';
import { Tabs, Tab } from '@/components/ui/Tabs';
import './UserProfilePage.css';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const history = useHistory();
  const [present] = useIonToast();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'proyectos' | 'sobre-mi'>('sobre-mi');

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await usersService.getUserByUsername(username!);
      setUser(userData);
      const projectsData = await projectsService.findAll();
      const userProjects = projectsData.filter(
        (p) => p.owner_user_id === userData.id
      );
      setProjects(userProjects);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      await present({
        message: 'Usuario no encontrado',
        duration: 3000,
        color: 'danger',
      });
      history.goBack();
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="profile-loading">
            <p>Cargando perfil...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!user) {
    return null;
  }

  const avatarUrl = user.getAvatarUrl();

  const gradients = {
    natillera: [
      'linear-gradient(135deg, #E568DB 0%, #A855F7 100%)',
      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    ],
    tokenization: [
      'linear-gradient(135deg, #FCD116 0%, #F59E0B 100%)',
      'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    ],
  };

  const portfolioProjects: PortfolioProject[] = projects.map((project, index) => {
    const isNatillera = project.type === 'NATILLERA';
    const gradientList = isNatillera ? gradients.natillera : gradients.tokenization;
    return {
      id: project.id,
      name: project.name,
      type: isNatillera ? 'natillera' : 'tokenizacion',
      changePercentage: 0,
      period: 'Anual',
      participants: 0,
      avatars: [],
      gradient: gradientList[index % gradientList.length],
      amount: 0,
      description: project.description_rich,
      emoji: undefined,
    };
  });

  const stats = [
    { value: projects.length, label: 'Inversiones' },
  ];

  const tabs: Tab[] = [
    { id: 'sobre-mi', label: 'Sobre mí' },
    { id: 'proyectos', label: 'Proyectos' },

  ];
  
  console.log('User profile data:', { user, projects, portfolioProjects });

  return (
    <IonPage>
      <IonContent fullscreen className="user-profile-page">
        <div className="profile-blue-banner">
          <ProfileHeader
            user={user}
            onBack={() => history.goBack()}
            onEdit={
              currentUser?.id === user.id
                ? () => history.push('/editar-perfil')
                : undefined
            }
          />
          <div className="profile-info-section">
            <div className="profile-avatar-container">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.getDisplayName()} className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {(user.getDisplayName() || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-details">
              <div className="profile-name-row">
                <h2 className="profile-display-name">{user.getDisplayName()}</h2>
                {user.verified && (
                  <IonIcon icon={checkmarkCircle} className="verified-icon-small" />
                )}
               <span className="profile-user-id">ID: {user.id.substring(0, 12)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-stats-section">
          <ProfileStats stats={stats} />
        </div>
        <div className="profile-tabs-wrapper">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as 'sobre-mi' | 'proyectos')}
          />
        </div>
        <div className="profile-content">
          {activeTab === 'proyectos' && (
            portfolioProjects.length === 0 ? (
              <div className="profile-empty-state">
                <div className="profile-empty-icon">📁</div>
                <p className="profile-empty-text">No hay proyectos aún</p>
              </div>
            ) : (
              <PortfolioGrid
                projects={portfolioProjects}
                onProjectClick={(project) => history.push(`/inversiones/${project.id}`)}
              />
            )
          )}

          {activeTab === 'sobre-mi' && (
            <div className="profile">
              <div className="profile-about">
                <h2 className='general-info'>General</h2>
                {user.username && (
                  <div className="profile-about-item">
                    <div className="profile-about-label">Username</div>
                    <div className="profile-about-value">@{user.username}</div>
                  </div>
                )}
                {user.email && (
                  <div className="profile-about-item">
                    <div className="profile-about-label">Email</div>
                    <div className="profile-about-value">{user.email}</div>
                  </div>
                )}
                {user.gender && (
                  <div className="profile-about-item">
                    <div className="profile-about-label">Género</div>
                    <div className="profile-about-value">
                      {user.gender === 'male' ? 'Hombre' : user.gender === 'female' ? 'Mujer' : user.gender === 'other' ? 'Otro' : 'Prefiero no decir'}
                    </div>
                  </div>
                )}
                {user.phone && (
                  <div className="profile-about-item">
                    <div className="profile-about-label">Teléfono</div>
                    <div className="profile-about-value">{user.phoneCountryCode} {user.phone}</div>
                  </div>
                )}
                <div className="profile-about-item">
                  <div className="profile-about-label">Miembro desde</div>
                  <div className="profile-about-value">
                    {new Date(user.createdAt).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UserProfilePage;

