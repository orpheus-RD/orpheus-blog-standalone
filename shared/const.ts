/**
 * Shared Constants
 * 
 * Constants used by both frontend and backend.
 */

export const SESSION_COOKIE_NAME = "app_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;

// Re-export error messages from errors module
export { UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG } from "./_core/errors";
