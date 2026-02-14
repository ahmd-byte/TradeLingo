import { useState } from 'react';
import LandingPage from './components/figma/LandingPage';
import Dashboard from './components/figma/Dashboard';
import { logout } from './services/authService';

export default function App() {
  // If a token already exists in localStorage the user is logged in.
  const hasToken = !!localStorage.getItem('token');
  const [view, setView] = useState<'landing' | 'dashboard'>(hasToken ? 'dashboard' : 'landing');

  const handleLogout = () => {
    logout();
    setView('landing');
  };

  const handleOnboardingComplete = () => {
    setView('dashboard');
  };

  if (view === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <LandingPage onComplete={handleOnboardingComplete} />;
}
