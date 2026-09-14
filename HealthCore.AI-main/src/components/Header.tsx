import React from 'react';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showBack, title, onBack }) => {
  return (
    <header className="header">
      <div className="header-left">
        {showBack ? (
          <button className="header-back" onClick={onBack} aria-label="Voltar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        )}
        <h1 className="header-title">{title || 'HealthCore.AI'}</h1>
      </div>
      <div className="header-right">
        <button className="header-btn" aria-label="Notificações">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge"></span>
        </button>
      </div>
    </header>
  );
};
