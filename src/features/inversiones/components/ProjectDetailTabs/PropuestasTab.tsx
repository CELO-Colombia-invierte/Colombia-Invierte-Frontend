import React, { useEffect, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Project } from '@/models/projects';
import { Propuesta } from '@/types/propuesta';
import { propuestasService } from '@/services/propuestas/propuestas.service';
import { PropuestaCard } from '../propuestas/PropuestaCard';
import './PropuestasTab.css';

interface PropuestasTabProps {
  project: Project;
}

const PAGE_SIZE = 10;

export const PropuestasTab: React.FC<PropuestasTabProps> = ({ project }) => {
  const history = useHistory();
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await propuestasService.getByProject(project.id, 1, PAGE_SIZE);
        setPropuestas(result.items ?? []);
        setHasMore(result.hasMore ?? false);
        setPage(1);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.id]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await propuestasService.getByProject(project.id, nextPage, PAGE_SIZE);
      setPropuestas((prev) => [...prev, ...(result.items ?? [])]);
      setHasMore(result.hasMore ?? false);
      setPage(nextPage);
    } catch {

    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = (propuestas ?? []).filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCrear = () => {
    history.push(`/crear-propuesta/${project.id}`);
  };

  const handleCardClick = (propuesta: Propuesta) => {
    history.push(`/ver-propuesta/${propuesta.id}`);
  };

  if (loading) {
    return (
      <div className="propuestas-tab">
        <div className="propuestas-loading">
          <IonSpinner name="crescent" />
        </div>
      </div>
    );
  }

  return (
    <div className="propuestas-tab">
      <div className="propuestas-search-row">
        <div className="propuestas-search-box">
          <svg className="propuestas-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="propuestas-search-input"
            placeholder="Buscar propuesta"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {filtered.length > 0 && searchQuery && (
          <button className="propuestas-ver-todo" onClick={() => setSearchQuery('')}>
            Ver todo
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="propuestas-empty">
          <div className="propuestas-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="propuestas-empty-text">Aún no tienes ninguna propuesta</p>
        </div>
      ) : (
        <div className="propuestas-list">
          {filtered.map((p, i) => (
            <PropuestaCard
              key={p.id}
              propuesta={p}
              index={i}
              onClick={() => handleCardClick(p)}
            />
          ))}
        </div>
      )}

      {hasMore && !searchQuery && (
        <button className="propuestas-load-more" onClick={handleLoadMore} disabled={loadingMore}>
          {loadingMore ? <IonSpinner name="crescent" /> : 'Cargar más'}
        </button>
      )}

      <div className="propuestas-footer">
        <button className="propuestas-btn-primary" onClick={handleCrear}>
          Hacer propuesta de negocio
        </button>
      </div>
    </div>
  );
};
