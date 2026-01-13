/**
 * Centralized Configuration Module
 * 
 * This module provides a unified configuration system that loads environment
 * variables using dotenv and validates required settings at startup.
 * 
 * For Render deployment: All variables should be set in Render Dashboard
 * For local development: Use .env file
 */

import "dotenv/config";

// ============================================================================
// Type Definitions
// ============================================================================

interface DatabaseConfig {
  url: string;
}

interface AuthConfig {
  jwtSecret: string;
  adminEmail: string;
  sessionCookieName: string;
  sessionMaxAge: number;
}

interface StorageConfig {
  provider: "s3" | "local";
  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
    endpoint?: string; // For S3-compatible services like R2
  };
}

interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ServerConfig {
  port: number;
  nodeEnv: "development" | "production" | "test";
  corsOrigins: string[];
}

interface AppConfig {
  database: DatabaseConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  openai: OpenAIConfig;
  server: ServerConfig;
}

// ============================================================================
// Environment Variable Helpers
// ============================================================================

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== "") {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Missing required environment variable: ${key}`);
}

function getEnvOptional(key: string, defaultValue: string = ""): string {
  return process.env[key] ?? defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${value}`);
  }
  return parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value.toLowerCase() === "true" || value === "1";
}

function getEnvArray(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value.split(",").map(s => s.trim()).filter(Boolean);
}

// ============================================================================
// Configuration Builder
// ============================================================================

function buildConfig(): AppConfig {
  const nodeEnv = getEnvOptional("NODE_ENV", "development") as AppConfig["server"]["nodeEnv"];
  const isProduction = nodeEnv === "production";

  return {
    database: {
      url: getEnv("DATABASE_URL"),
    },

    auth: {
      jwtSecret: getEnv("JWT_SECRET"),
      adminEmail: getEnvOptional("ADMIN_EMAIL", ""),
      sessionCookieName: getEnvOptional("SESSION_COOKIE_NAME", "app_session"),
      sessionMaxAge: getEnvNumber("SESSION_MAX_AGE_DAYS", 365) * 24 * 60 * 60 * 1000,
    },

    storage: {
      provider: getEnvOptional("STORAGE_PROVIDER", "s3") as "s3" | "local",
      s3: {
        accessKeyId: getEnvOptional("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: getEnvOptional("AWS_SECRET_ACCESS_KEY", ""),
        bucket: getEnvOptional("S3_BUCKET", ""),
        region: getEnvOptional("AWS_REGION", "us-east-1"),
        endpoint: getEnvOptional("S3_ENDPOINT", ""), // For Cloudflare R2 or MinIO
      },
    },

    openai: {
      apiKey: getEnvOptional("OPENAI_API_KEY", ""),
      baseUrl: getEnvOptional("OPENAI_BASE_URL", "https://api.openai.com/v1"),
      model: getEnvOptional("OPENAI_MODEL", "gpt-4o-mini"),
    },

    server: {
      port: getEnvNumber("PORT", 3000),
      nodeEnv,
      corsOrigins: getEnvArray("CORS_ORIGINS", isProduction ? [] : ["http://localhost:5173", "http://localhost:3000"]),
    },
  };
}

// ============================================================================
// Singleton Export
// ============================================================================

let _config: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!_config) {
    _config = buildConfig();
  }
  return _config;
}

// Convenience exports for common access patterns
export const config = {
  get database() {
    return getConfig().database;
  },
  get auth() {
    return getConfig().auth;
  },
  get storage() {
    return getConfig().storage;
  },
  get openai() {
    return getConfig().openai;
  },
  get server() {
    return getConfig().server;
  },
  get isProduction() {
    return getConfig().server.nodeEnv === "production";
  },
  get isDevelopment() {
    return getConfig().server.nodeEnv === "development";
  },
};

// ============================================================================
// Validation
// ============================================================================

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const cfg = getConfig();

  // Required for all environments
  if (!cfg.database.url) {
    errors.push("DATABASE_URL is required");
  }
  if (!cfg.auth.jwtSecret) {
    errors.push("JWT_SECRET is required");
  }

  // Required for production
  if (cfg.server.nodeEnv === "production") {
    if (cfg.server.corsOrigins.length === 0) {
      errors.push("CORS_ORIGINS must be set in production");
    }
    if (!cfg.storage.s3.accessKeyId || !cfg.storage.s3.secretAccessKey) {
      console.warn("[Config] S3 credentials not set - file upload will be disabled");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Legacy ENV Export (for backward compatibility during migration)
// ============================================================================

/**
 * @deprecated Use `config` instead. This export is for backward compatibility.
 */
export const ENV = {
  get cookieSecret() {
    return config.auth.jwtSecret;
  },
  get databaseUrl() {
    return config.database.url;
  },
  get adminEmail() {
    return config.auth.adminEmail;
  },
  get isProduction() {
    return config.isProduction;
  },
  // Storage
  get s3AccessKeyId() {
    return config.storage.s3.accessKeyId;
  },
  get s3SecretAccessKey() {
    return config.storage.s3.secretAccessKey;
  },
  get s3Bucket() {
    return config.storage.s3.bucket;
  },
  get s3Region() {
    return config.storage.s3.region;
  },
  get s3Endpoint() {
    return config.storage.s3.endpoint;
  },
  // OpenAI
  get openaiApiKey() {
    return config.openai.apiKey;
  },
  get openaiBaseUrl() {
    return config.openai.baseUrl;
  },
  get openaiModel() {
    return config.openai.model;
  },
};
