import React, { useState, useEffect } from 'react';
import { createHashRouter, RouterProvider, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import AuthPage from './pages/AuthPage';

import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import FacilitiesPage from './pages/FacilitiesPage';
import EvaluationFormPage from './pages/EvaluationFormPage';
import PredispositionFormPage from './pages/PredispositionFormPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';

interface UserSession {
  name: string;
  email: string;
  role: string;
  district: string;
}

const Layout = ({ user, onLogout }: { user: UserSession | null; onLogout: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const showBack = location.pathname === '/map/facilities' || location.pathname === '/form/predisposition';
  
  let pageTitle = '';
  if (location.pathname === '/map/facilities') {
    pageTitle = 'Hospitais & UBSs Próximos';
  } else if (location.pathname === '/form/predisposition') {
    pageTitle = 'Análise de Predisposição';
  }

  const isMapPage = location.pathname === '/map';

  return (
    <div className="app-container">
      <Header 
        showBack={showBack} 
        title={pageTitle}
        onBack={() => navigate(-1)} 
        user={user}
        onLogout={onLogout}
      />
      <main className={`page-content ${isMapPage ? 'map-page-layout' : ''}`} style={isMapPage ? { padding: 0, maxWidth: '100%' } : {}}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export const App = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('healthcore_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('healthcore_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const router = createHashRouter([
    {
      path: "/",
      element: <Layout user={currentUser} onLogout={handleLogout} />,
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/map", element: <MapPage /> },
        { path: "/map/facilities", element: <FacilitiesPage /> },
        { path: "/form/evaluation", element: <EvaluationFormPage /> },
        { path: "/form/predisposition", element: <PredispositionFormPage /> },
        { path: "/game", element: <GamePage /> },
        { path: "/profile", element: <ProfilePage /> },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default App;
