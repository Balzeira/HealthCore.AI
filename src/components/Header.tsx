import React, { useState, useEffect } from 'react';
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { to: '/', label: 'Início', icon: '🏠', tag: 'Painel Geral', desc: 'Visão executiva e alertas prioritários' },
    { to: '/map', label: 'Mapa Sanitário SP', icon: '🗺️', tag: 'Geoprocessamento', desc: '96 distritos e zonas de risco' },
    { to: '/diseases', label: 'Doenças & Alertas', icon: '🦠', tag: 'Vigilância SUS', desc: 'Monitoramento de arboviroses e TOP 5' },
    { to: '/map/facilities', label: 'Rede de Saúde', icon: '🏥', tag: 'Hospitais & UPAs', desc: 'Prontos-Socorros e unidades de atendimento' },
    { to: '/methodology', label: 'Metodologia', icon: '📚', tag: 'Transparência', desc: 'Fontes públicas e critérios de auditoria' },
    { to: '/form/evaluation', label: 'Avaliar Bairro', icon: '📝', tag: 'Participação Cidadã', desc: 'Envio de relatos comunitários' },
    { to: '/form/predisposition', label: 'Fatores de Risco', icon: '🩺', tag: 'Análise Clínica', desc: 'Cálculo de predisposição e vulnerabilidade' },
    { to: '/game', label: 'Missão do Agente', icon: '🎮', tag: 'Capacitação', desc: 'Treinamento interativo em saúde pública' },
  ];

  return (
    <>
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
            <span className="header-brand-tag">Inteligência em Saúde Urbana</span>
          </div>
        </div>

        {/* 2. Center Hamburger Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className={`header-hamburger-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            title="Menu de navegação"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: menuOpen ? 'rgba(37, 99, 235, 0.25)' : 'rgba(15, 23, 42, 0.9)',
              border: `1.5px solid ${menuOpen ? '#3B82F6' : '#334155'}`,
              borderRadius: '12px',
              padding: '8px 16px',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: menuOpen ? '0 0 16px rgba(59, 130, 246, 0.35)' : '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Animated Hamburger Icon */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '18px',
              height: '14px',
              position: 'relative'
            }}>
              <span style={{
                display: 'block',
                height: '2px',
                width: '100%',
                backgroundColor: menuOpen ? '#60A5FA' : '#FFFFFF',
                borderRadius: '2px',
                transition: 'all 0.25s ease',
                transform: menuOpen ? 'rotate(45deg) translate(4px, 5px)' : 'none'
              }} />
              <span style={{
                display: 'block',
                height: '2px',
                width: '100%',
                backgroundColor: menuOpen ? '#60A5FA' : '#FFFFFF',
                borderRadius: '2px',
                transition: 'all 0.25s ease',
                opacity: menuOpen ? 0 : 1
              }} />
              <span style={{
                display: 'block',
                height: '2px',
                width: '100%',
                backgroundColor: menuOpen ? '#60A5FA' : '#FFFFFF',
                borderRadius: '2px',
                transition: 'all 0.25s ease',
                transform: menuOpen ? 'rotate(-45deg) translate(4px, -5px)' : 'none'
              }} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.2px' }}>
              {menuOpen ? 'Fechar Menu' : 'Menu de Opções'}
            </span>
          </button>
        </div>

        {/* 3. Right Status & User Account Section */}
        <div className="header-user-section">
          {/* Compact Live Status Dot */}
          <div className="header-live-badge-compact" title="96 Distritos e 32 Subprefeituras de SP Monitoradas">
            <span className="header-live-dot"></span>
            <span>Monitoramento SP</span>
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

      {/* Hamburger Drawer Overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(3, 7, 18, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      {/* Hamburger Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0B1120',
          borderLeft: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🏥</span>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                HealthCore<span style={{ color: '#60A5FA' }}>.AI</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Menu de Navegação Principal</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              color: '#94A3B8',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Nav Links */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', paddingLeft: '8px' }}>
            Módulos do Sistema
          </span>

          {navLinks.map(link => {
            const isActive = location.pathname === link.to;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: isActive ? '1.5px solid #3B82F6' : '1px solid #1E293B',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#2563EB' : '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {link.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: isActive ? '#FFFFFF' : '#E2E8F0', fontWeight: 800 }}>
                      {link.label}
                    </strong>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: isActive ? '#93C5FD' : '#64748B',
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.25)' : '#070B14',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {link.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0' }}>
                    {link.desc}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #1E293B',
          backgroundColor: '#070B14',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>👤</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#60A5FA' }}>{user.role} • {user.district}</div>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    color: '#EF4444',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Sair ⏻
                </button>
              )}
            </div>
          )}

          <div style={{ fontSize: '0.72rem', color: '#64748B', textAlign: 'center' }}>
            HealthCore.AI SP • Sistema Oficial de Vigilância Urbana
          </div>
        </div>
      </div>
    </>
  );
};
