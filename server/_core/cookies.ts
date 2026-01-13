import type { CookieOptions, Request } from "express";
import { config } from "./config";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isProduction = config.isProduction;
  const isSecure = isSecureRequest(req);

  // For cross-domain requests in production (Vercel frontend + Render backend),
  // we need SameSite=None and Secure=true
  // However, this requires HTTPS on both ends
  
  return {
    httpOnly: true,
    path: "/",
    // In production with HTTPS, use 'none' for cross-origin requests
    // This allows cookies to be sent in cross-origin requests
    sameSite: isProduction && isSecure ? "none" : "lax",
    secure: isSecure,
  };
}
