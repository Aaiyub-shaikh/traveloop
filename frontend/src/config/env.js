/**
 * Typed access to Vite env — use instead of scattering import.meta.env
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_URL ?? "",
  appName: import.meta.env.VITE_APP_NAME ?? "Traveloop",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
