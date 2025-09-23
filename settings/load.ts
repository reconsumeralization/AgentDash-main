/**
 * Secure Settings Loading for Gemini CLI
 * 
 * This module implements secure loading of settings files with environment
 * variable provenance tracking to prevent secret leakage.
 * 
 * @author David Amber "WebDUH LLC" Weatherspoon
 * @security Critical - Prevents credential leakage in settings files
 */

import fs from "node:fs";
import { parse as parseJsonc } from "jsonc-parser";
import { SettingsFile, Json } from "./types";

/**
 * Load settings file with dual-state management
 * 
 * @param path Path to the settings file
 * @returns SettingsFile with both resolved and original content
 */
export function loadSettingsFile(path: string): SettingsFile {
  const text = fs.readFileSync(path, "utf-8");
  const original = parseJsonc(text) as any;

  const originEnvMap = new Map<string, string>();
  const resolved = resolveWithProvenance(original, "", originEnvMap);

  return { 
    path, 
    settings: resolved, 
    original, 
    originEnvMap 
  };
}

/**
 * Resolve environment variables while tracking their provenance
 * 
 * @param v Value to resolve
 * @param p JSON pointer path
 * @param m Map to store environment variable provenance
 * @returns Resolved value with environment variables substituted
 */
function resolveWithProvenance(v: any, p: string, m: Map<string, string>): any {
  if (typeof v === "string") {
    const token = matchEnvRef(v);
    if (token) {
      m.set(p, token);
      return process.env[tokenToName(token)] ?? v; // use env var, fallback to placeholder
    }
    return v;
  }
  
  if (Array.isArray(v)) {
    return v.map((x, i) => resolveWithProvenance(x, `${p}/${i}`, m));
  }
  
  if (v && typeof v === "object") {
    const out: any = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = resolveWithProvenance(val, `${p}/${escapePtr(k)}`, m);
    }
    return out;
  }
  
  return v;
}

/**
 * Match environment variable reference patterns
 * 
 * Supports:
 * - $API_KEY (simple format)
 * - ${env:JWT_SECRET} (bracket format)
 * 
 * @param s String to check for environment variable references
 * @returns Matched token or null
 */
function matchEnvRef(s: string): string | null {
  // Simple format: $VARIABLE_NAME
  if (/^\$[A-Z_][A-Z0-9_]*$/.test(s)) {
    return s;
  }
  
  // Bracket format: ${env:VARIABLE_NAME}
  const bracketMatch = s.match(/^\$\{env:([A-Z_][A-Z0-9_]*)\}$/);
  if (bracketMatch) {
    return `$${bracketMatch[1]}`;
  }
  
  return null;
}

/**
 * Convert environment variable token to environment variable name
 * 
 * @param token Token like "$API_KEY" or "${env:JWT_SECRET}"
 * @returns Environment variable name like "API_KEY"
 */
function tokenToName(token: string): string {
  return token.replace(/^\$/, "");
}

/**
 * Escape JSON pointer special characters
 * 
 * @param k Key to escape
 * @returns Escaped key for JSON pointer
 */
function escapePtr(k: string): string {
  return k.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * Validate that a settings file contains no leaked secrets
 * 
 * @param path Path to settings file
 * @returns True if file is safe (no secrets), false if secrets detected
 */
export function validateSettingsFile(path: string): boolean {
  try {
    const text = fs.readFileSync(path, "utf-8");
    
    // Check for common secret patterns that shouldn't be in config files
    const secretPatterns = [
      /sk-[a-zA-Z0-9]{20,}/, // OpenAI API keys
      /pk_[a-zA-Z0-9]{20,}/, // Stripe keys
      /[a-zA-Z0-9]{32,}/, // Generic long tokens
      /password["\s]*[:=]["\s]*[^$]/i, // Hardcoded passwords
      /secret["\s]*[:=]["\s]*[^$]/i, // Hardcoded secrets
    ];
    
    for (const pattern of secretPatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
