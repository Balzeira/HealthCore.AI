import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  onBack?: () => void;
  user?: { name: string; email: string; role: string; district: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const navRef = React.useRef<HTMLDivElement>(null);

  const scrollNav = (dir: 'left' | 'right') => {
    if (navRef.current) {
      navRef.current.scrollBy({
        left: dir === 'left' ? -150 : 150,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="executive-header">
      {/* 1. Left Brand Section */}
      <div className="header-brand-box" onClick={() => navigate('/')}>
        <div className="header-brand-logo">
          <span style={{ fontSize: '20px' }}>🏥</span>
        </div>
        <div className="header-brand-text">
          <div className="header-brand-name">
            HealthCore<span className="brand-dot">.AI</span>
            <span className="header-badge-sp">SP</span>
          </div>
          <span className="header-brand-tag">Observatório da Capital</span>
        </div>
      </div>

      {/* 2. Center Navigation Capsule with Side Arrow Controls */}
      <div className="header-nav-wrapper">
        <button 
          type="button" 
          className="header-nav-scroll-btn header-nav-scroll-left"
          onClick={() => scrollNav('left')}
          title="Rolar menu para esquerda"
          aria-label="Rolar menu para esquerda"
        >
          ‹
        </button>

        <nav className="header-nav-capsule" ref={navRef}>
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Início</span>
          </NavLink>

          <NavLink 
            to="/map" 
            end
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-label">Mapa SP</span>
          </NavLink>

          <NavLink 
            to="/map/facilities" 
            end
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🏥</span>
            <span className="nav-label">Hospitais</span>
          </NavLink>

          <NavLink 
            to="/form/evaluation" 
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-label">Avaliar Bairro</span>
          </NavLink>

          <NavLink 
            to="/form/predisposition" 
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🩺</span>
            <span className="nav-label">Predisposição</span>
          </NavLink>

          <NavLink 
            to="/game" 
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🎮</span>
            <span className="nav-label">Missão Agente</span>
          </NavLink>
        </nav>

        <button 
          type="button" 
          className="header-nav-scroll-btn header-nav-scroll-right"
          onClick={() => scrollNav('right')}
          title="Rolar menu para direita"
          aria-label="Rolar menu para direita"
        >
          ›
        </button>
      </div>

      {/* 3. Right Status & User Account Section (100% Visível & Sem Cortes) */}
      <div className="header-user-section">
        {/* Compact Live Status Dot */}
        <div className="header-live-badge-compact" title="32 Subprefeituras de SP Monitoradas em Tempo Real">
          <span className="header-live-dot"></span>
          <span>Ao Vivo</span>
        </div>

        {/* User Account & Logout Control */}
        {user ? (
          <div className="header-account-card">
            <div 
              className="header-account-info" 
              onClick={() => navigate('/profile')}
              title={`Conectado como: ${user.name} (${user.email})`}
            >
              <span className="header-user-avatar">👤</span>
              <div className="header-user-text">
                <span className="header-user-name">{user.name}</span>
                <span className="header-user-role">{user.role || 'Cidadão'}</span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="header-logout-btn"
                title="Clique para sair do seu login"
              >
                <span>Sair</span>
                <span style={{ fontSize: '12px' }}>⏻</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
};
