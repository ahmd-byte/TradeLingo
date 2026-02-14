import { useState } from 'react';
import LandingPage from './components/figma/LandingPage';
import Dashboard from './components/figma/Dashboard';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('dashboard');

  const handleLogout = () => {
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
