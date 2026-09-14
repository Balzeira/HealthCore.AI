import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';

import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import FacilitiesPage from './pages/FacilitiesPage';
import EvaluationFormPage from './pages/EvaluationFormPage';
import PredispositionFormPage from './pages/PredispositionFormPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const showBack = location.pathname === '/map/facilities' || location.pathname === '/form/predisposition';
  
  let pageTitle = '';
  if (location.pathname === '/map/facilities') {
    pageTitle = 'Hospitais Próximos';
  } else if (location.pathname === '/form/predisposition') {
    pageTitle = 'Análise de Predisposição';
  }

  return (
    <div className="app-container">
      <Header 
        showBack={showBack} 
        title={pageTitle}
        onBack={() => navigate(-1)} 
      />
      <main className="page-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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

export const App = () => {
  return <RouterProvider router={router} />;
};

export default App;

