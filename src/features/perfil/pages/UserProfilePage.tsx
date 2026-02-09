import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon, useIonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { checkmarkCircle } from 'ionicons/icons';
import { usersService } from '@/services/users';
import { projectsService } from '@/services/projects';
import { User } from '@/models/User.model';
import { Project } from '@/models/projects';
import { ProfileHeader, ProfileStats, ProfileProjectCard } from '../components';
import { Tabs, Tab } from '@/components/ui/Tabs';
import './UserProfilePage.css';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const history = useHistory();
  const [present] = useIonToast();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'proyectos' | 'sobre-mi'>('proyectos');

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

      // Obtener proyectos del usuario
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

  const stats = [
    { value: projects.length, label: 'Proyectos' },
  ];

  const tabs: Tab[] = [
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'sobre-mi', label: 'Sobre mí' },
  ];

  return (
    <IonPage>
      <IonContent fullscreen className="user-profile-page">
        {/* Header */}
        <ProfileHeader user={user} onBack={() => history.goBack()} />

        {/* Profile Info Section */}
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

          <ProfileStats stats={stats} />
        </div>

        {/* User Details */}
        <div className="profile-details">
          <div className="profile-name-row">
            <h2 className="profile-display-name">{user.getDisplayName()}</h2>
            {user.verified && (
              <IonIcon icon={checkmarkCircle} className="verified-icon-small" />
            )}
          </div>
          {user.username && (
            <p className="profile-username">@{user.username}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="profile-tabs-wrapper">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as 'proyectos' | 'sobre-mi')}
          />
        </div>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'proyectos' && (
            <div className="profile-projects-grid">
              {projects.length === 0 ? (
                <div className="profile-empty-state">
                  <div className="profile-empty-icon">📁</div>
                  <p className="profile-empty-text">No hay proyectos aún</p>
                </div>
              ) : (
                projects.map((project) => (
                  <ProfileProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          )}

          {activeTab === 'sobre-mi' && (
            <div className="profile-about">
              {user.email && (
                <div className="profile-about-item">
                  <div className="profile-about-label">Email</div>
                  <div className="profile-about-value">{user.email}</div>
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
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UserProfilePage;

