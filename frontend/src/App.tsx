import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/figma/LandingPage';
import Dashboard from './components/figma/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing / Onboarding */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard with nested routes */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        
        {/* Redirect old routes or unknown paths */}
        <Route path="*" element={<Navigate to="/dashboard/learn" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
