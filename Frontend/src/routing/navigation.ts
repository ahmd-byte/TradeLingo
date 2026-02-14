import { useEffect, useState } from "react";

export function normalizePath(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  const trimmedPath = pathname.replace(/\/+$/, "");
  return trimmedPath === "" ? "/" : trimmedPath;
}

export function navigateTo(pathname: string, replace = false): void {
  const targetPath = normalizePath(pathname);
  const currentPath = normalizePath(window.location.pathname);

  if (targetPath === currentPath) {
    return;
  }

  if (replace) {
    window.history.replaceState(null, "", targetPath);
  } else {
    window.history.pushState(null, "", targetPath);
  }

  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return pathname;
}
