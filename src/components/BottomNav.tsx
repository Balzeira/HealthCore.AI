import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Início</span>
      </NavLink>

      <NavLink to="/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
        <span>Mapa SP</span>
      </NavLink>

      <NavLink to="/map/facilities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20"></path>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        <span>Hospitais</span>
      </NavLink>

      <NavLink to="/form/evaluation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span>Avaliar</span>
      </NavLink>

      <NavLink to="/game" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6 2 18 2 18 6 6 6"></polygon>
          <rect x="3" y="6" width="18" height="16" rx="2"></rect>
          <path d="M10 12h4"></path>
          <path d="M12 10v4"></path>
        </svg>
        <span>Missão</span>
      </NavLink>
    </nav>
  );
};
