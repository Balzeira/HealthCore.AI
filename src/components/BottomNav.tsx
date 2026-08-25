import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveClass = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item home ${getActiveClass('/', true)}`}
        onClick={() => navigate('/')}
      >
        <div className="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={getActiveClass('/', true) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span className="nav-label">Início</span>
      </button>
      
      <button 
        className={`nav-item map ${getActiveClass('/map')}`}
        onClick={() => navigate('/map')}
      >
        <div className="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={getActiveClass('/map') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </div>
        <span className="nav-label">Mapa</span>
      </button>
      
      <button 
        className={`nav-item form ${getActiveClass('/form')}`}
        onClick={() => navigate('/form/evaluation')}
      >
        <div className="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={getActiveClass('/form') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M9 14h6"></path>
            <path d="M9 18h6"></path>
            <path d="M9 10h.01"></path>
          </svg>
        </div>
        <span className="nav-label">Avaliar</span>
      </button>
      
      <button 
        className={`nav-item profile ${getActiveClass('/profile')}`}
        onClick={() => navigate('/profile')}
      >
        <div className="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={getActiveClass('/profile') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span className="nav-label">Perfil</span>
      </button>
    </nav>
  );
};
