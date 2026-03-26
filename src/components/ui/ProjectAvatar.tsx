import React from 'react';
import './ProjectAvatar.css';

interface ProjectAvatarProps {
  id: string;
  name: string;
  size?: number;
  imageUrl?: string | null;
}

const GRADIENTS = [
  { from: '#5b5bd6', to: '#7c7de8', shadow: 'rgba(91, 91, 214, 0.35)' },
  { from: '#e09b2d', to: '#f0b942', shadow: 'rgba(224, 155, 45, 0.35)' },
  { from: '#ef4444', to: '#f87171', shadow: 'rgba(239, 68, 68, 0.35)' },
  { from: '#14b8a6', to: '#2dd4bf', shadow: 'rgba(20, 184, 166, 0.35)' },
  { from: '#a855f7', to: '#c084fc', shadow: 'rgba(168, 85, 247, 0.35)' },
];

/* Ícono natillera de Figma — 8 puntos en anillo */
const NatilleraIcon = () => (
  <svg viewBox="19 15 42 42" width="40" height="40" fill="none">
    <rect x="37.8848" y="19"      width="5.23077" height="5.23077" rx="2.61538" fill="white"/>
    <rect x="37.8845" y="47.769"  width="5.23077" height="5.23077" rx="2.61538" fill="white"/>
    <rect x="57.5"    y="33.3843" width="5.23077" height="5.23077" rx="2.61538" transform="rotate(90 57.5 33.3843)"       fill="white"/>
    <rect x="28.7307" y="33.3843" width="5.23077" height="5.23077" rx="2.61538" transform="rotate(90 28.7307 33.3843)"   fill="white"/>
    <rect x="30.3291" y="49.8706" width="5.23077" height="5.23077" rx="2.61538" transform="rotate(-135 30.3291 49.8706)" fill="white"/>
    <rect x="50.6719" y="29.5273" width="5.23077" height="5.23077" rx="2.61538" transform="rotate(-135 50.6719 29.5273)" fill="white"/>
    <rect x="26.6296" y="25.8281" width="5.23077" height="5.23077" rx="2.61538" transform="rotate(-45 26.6296 25.8281)"  fill="white"/>
    <rect x="46.9727" y="46.1709" width="5.23077" height="5.23077" rx="2.61538" transform="rotate(-45 46.9727 46.1709)"  fill="white"/>
  </svg>
);

/* Ícono tokenización de Figma — edificio/cuadrícula */
const TokenizacionIcon = () => (
  <svg viewBox="22 18 36 36" width="36" height="36" fill="none">
    <path d="M48.5 35H45V27C45 26.7348 44.8946 26.4804 44.7071 26.2929C44.5196 26.1054 44.2652 26 44 26H35C34.7348 26 34.4804 26.1054 34.2929 26.2929C34.1054 26.4804 34 26.7348 34 27V35H30.5C30.2348 35 29.9804 35.1054 29.7929 35.2929C29.6054 35.4804 29.5 35.7348 29.5 36V45C29.5 45.2652 29.6054 45.5196 29.7929 45.7071C29.9804 45.8946 30.2348 46 30.5 46H48.5C48.7652 46 49.0196 45.8946 49.2071 45.7071C49.3946 45.5196 49.5 45.2652 49.5 45V36C49.5 35.7348 49.3946 35.4804 49.2071 35.2929C49.0196 35.1054 48.7652 35 48.5 35ZM38.5 44H31.5V37H38.5V44ZM36 35V28H43V35H36ZM47.5 44H40.5V37H47.5V44Z" fill="white"/>
  </svg>
);


const getIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('tokeniz') || lower.includes('token')) return <TokenizacionIcon />;
  return <NatilleraIcon />;
};

const getColorIndex = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % GRADIENTS.length;
};

export const ProjectAvatar: React.FC<ProjectAvatarProps> = ({ id, name, size = 48, imageUrl }) => {
  if (imageUrl) {
    return (
      <div
        className="project-avatar project-avatar--image"
        style={{ width: size, height: size }}
      >
        <img src={imageUrl} alt={name} className="project-avatar-img" />
      </div>
    );
  }

  const gradient = GRADIENTS[getColorIndex(id)];

  return (
    <div
      className="project-avatar"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})`,
        boxShadow: `0 4px 12px ${gradient.shadow}`,
      }}
    >
      {getIcon(name)}
    </div>
  );
};

export default ProjectAvatar;
