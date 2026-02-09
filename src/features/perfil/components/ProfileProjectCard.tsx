import React from 'react';
import { useHistory } from 'react-router-dom';
import { Project } from '@/models/projects';
import './ProfileProjectCard.css';

interface ProfileProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export const ProfileProjectCard: React.FC<ProfileProjectCardProps> = ({
  project,
  onClick,
}) => {
  const history = useHistory();

  const coverImageUrl = project.cover_asset_id
    ? `${import.meta.env.VITE_API_URL || ''}/assets/${project.cover_asset_id}`
    : undefined;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      history.push(`/inversiones/${project.id}`);
    }
  };

  return (
    <div className="profile-project-card" onClick={handleClick}>
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt={project.name}
          className="profile-project-image"
        />
      ) : (
        <div className="profile-project-placeholder">
          <span className="profile-project-initial">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="profile-project-overlay">
        <div className="profile-project-info">
          <span className="profile-project-name">{project.name}</span>
          {project.type && (
            <span className="profile-project-type">
              {project.type === 'NATILLERA' ? 'Natillera' : 'Tokenización'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileProjectCard;
