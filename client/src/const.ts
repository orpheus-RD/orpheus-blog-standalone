/**
 * Frontend Constants
 * 
 * Configuration values and constants for the frontend application.
 */

// Session configuration
export const SESSION_COOKIE_NAME = "app_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Get the login URL
 * 
 * For the simplified auth system, this returns the admin login page.
 * The login page is part of the frontend SPA.
 */
export const getLoginUrl = (): string => {
  return "/admin/login";
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if we're in production mode
 */
export const isProduction = import.meta.env.PROD;
