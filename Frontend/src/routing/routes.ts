export const APP_ROUTES = {
  home: "/",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  onboarding: "/onboarding",
  dashboard: {
    root: "/app",
    learn: "/app/learn",
    superbear: "/app/superbear",
    streaks: "/app/streaks",
    profile: "/app/profile",
  },
} as const;

export type DashboardTab = "learn" | "superbear" | "streaks" | "profile";

export const DASHBOARD_ROUTE_BY_TAB: Record<DashboardTab, string> = {
  learn: APP_ROUTES.dashboard.learn,
  superbear: APP_ROUTES.dashboard.superbear,
  streaks: APP_ROUTES.dashboard.streaks,
  profile: APP_ROUTES.dashboard.profile,
};

export const DASHBOARD_TAB_BY_ROUTE: Record<string, DashboardTab> = {
  [APP_ROUTES.dashboard.learn]: "learn",
  [APP_ROUTES.dashboard.superbear]: "superbear",
  [APP_ROUTES.dashboard.streaks]: "streaks",
  [APP_ROUTES.dashboard.profile]: "profile",
};
