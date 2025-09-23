/**
 * Secure Settings Types for Gemini CLI
 * 
 * This module defines types for dual-state settings management that prevents
 * environment variable secrets from being serialized back to disk.
 * 
 * @author David Amber "WebDUH LLC" Weatherspoon
 * @security Critical - Prevents credential leakage in settings files
 */

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/**
 * SettingsFile interface with dual-state management
 * 
 * - settings: Resolved values for runtime use (secrets resolved from env vars)
 * - original: Raw file content with $VAR placeholders preserved
 * - originEnvMap: Maps JSON pointers to original environment variable tokens
 */
export interface SettingsFile {
  /** Path to the settings file */
  path: string;
  
  /** Resolved values (for runtime only) - secrets are resolved from environment */
  settings: Json;
  
  /** Raw-from-disk JSON (with $VARS) kept separately to preserve placeholders */
  original?: Json;
  
  /** Map of JSON pointer -> original env token (e.g., "$API_KEY" or "${env:JWT_SECRET}") */
  originEnvMap?: Map<string, string>;
}

/**
 * Environment variable reference patterns
 */
export type EnvRefPattern = '$API_KEY' | '${env:JWT_SECRET}' | string;

/**
 * Settings operation result
 */
export interface SettingsResult {
  success: boolean;
  error?: string;
  preservedEnvVars?: string[];
}
