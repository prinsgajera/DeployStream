export const APP_NAME = "DeployStream";

export const pageTitle = (...parts: string[]): string => [...parts, APP_NAME].join(" · ");

export const DEPLOYED_BASE_DOMAIN: string = import.meta.env.VITE_DEPLOYED_BASE_DOMAIN ?? "";
