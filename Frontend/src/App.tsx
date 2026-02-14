import LandingPage from './components/figma/LandingPage';
import Dashboard from './components/figma/Dashboard';
import LoginForm from './components/figma/LoginForm';
import SignUpForm from './components/figma/SignUpForm';
import OnboardingFlow from './components/figma/OnboardingFlow';
import { APP_ROUTES, DASHBOARD_ROUTE_BY_TAB, DASHBOARD_TAB_BY_ROUTE } from './routing/routes';
import { navigateTo, usePathname } from './routing/navigation';
import { clearSession, isAuthenticated } from './routing/auth';
import { useEffect } from 'react';

function Redirect({ to, replace = true }: { to: string; replace?: boolean }) {
  useEffect(() => {
    navigateTo(to, replace);
  }, [to, replace]);

  return null;
}

export default function App() {
  const pathname = usePathname();
  const authenticated = isAuthenticated();

  if (pathname === APP_ROUTES.home) {
    return (
      <LandingPage
        onSignUpClick={() => navigateTo(APP_ROUTES.auth.register)}
        onLoginClick={() => navigateTo(APP_ROUTES.auth.login)}
      />
    );
  }

  if (pathname === APP_ROUTES.auth.register) {
    return (
      <SignUpForm
        onBack={() => navigateTo(APP_ROUTES.home)}
        onLogin={() => navigateTo(APP_ROUTES.auth.login)}
        onSuccess={() => navigateTo(APP_ROUTES.onboarding)}
      />
    );
  }

  if (pathname === APP_ROUTES.auth.login) {
    return (
      <LoginForm
        onBack={() => navigateTo(APP_ROUTES.home)}
        onSuccess={() => navigateTo(APP_ROUTES.dashboard.learn, true)}
      />
    );
  }

  if (pathname === APP_ROUTES.onboarding) {
    if (!authenticated) {
      return <Redirect to={APP_ROUTES.auth.register} />;
    }

    return <OnboardingFlow onComplete={() => navigateTo(APP_ROUTES.dashboard.learn, true)} />;
  }

  if (pathname === APP_ROUTES.dashboard.root) {
    return <Redirect to={APP_ROUTES.dashboard.learn} />;
  }

  const activeTab = DASHBOARD_TAB_BY_ROUTE[pathname];
  if (activeTab) {
    if (!authenticated) {
      return <Redirect to={APP_ROUTES.auth.login} />;
    }

    return (
      <Dashboard
        activeTab={activeTab}
        onTabChange={(tab) => navigateTo(DASHBOARD_ROUTE_BY_TAB[tab])}
        onLogout={() => {
          clearSession();
          navigateTo(APP_ROUTES.home, true);
        }}
      />
    );
  }

  return <Redirect to={APP_ROUTES.home} />;
}
