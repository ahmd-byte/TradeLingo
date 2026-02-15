import { useState } from 'react';
import LandingPage from './components/screens/LandingPage';
import Dashboard from './components/screens/Dashboard';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('dashboard');

  const handleLogout = () => {
    setView('landing');
  };

  const handleOnboardingComplete = () => {
    setView('dashboard');
  };

  if (view === 'landing') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <LandingPage onComplete={handleOnboardingComplete} />;
}
