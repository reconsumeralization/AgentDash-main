/**
 * Secure Settings Modification for Gemini CLI
 * 
 * This module implements secure setting modification that preserves environment
 * variable placeholders while allowing runtime updates.
 * 
 * @author David Amber "WebDUH LLC" Weatherspoon
 * @security Critical - Prevents credential leakage in settings files
 */

import fs from "node:fs";
import { SettingsFile, Json, SettingsResult } from "./types";
import { deepClone, setByPtr } from "./util";

/**
 * Set a value in settings while preserving environment variable placeholders
 * 
 * This function updates both the in-memory resolved view and the original
 * content, ensuring that environment variable placeholders are preserved
 * unless explicitly overridden by the user.
 * 
 * @param sf Settings file object
 * @param jsonPointer JSON pointer to the value to set
 * @param value New value to set
 * @returns SettingsResult indicating success/failure
 */
export function setValue(sf: SettingsFile, jsonPointer: string, value: Json): SettingsResult {
  try {
    // Update in-memory resolved view
    setByPtr(sf.settings, jsonPointer, value);

    // Update ORIGINAL content, preserving env var placeholders
    const original = deepClone(sf.original ?? {});
    const isEnvBacked = sf.originEnvMap?.has(jsonPointer);

    if (isEnvBacked && typeof value === "string") {
      // Check if this is an explicit user edit or a resolved environment variable
      const originalToken = sf.originEnvMap?.get(jsonPointer);
      const resolvedValue = process.env[originalToken?.replace(/^\$/, "") ?? ""];
      
      // If the value matches the resolved environment variable, preserve the placeholder
      if (value === resolvedValue && originalToken) {
        // Keep the original placeholder - don't update the original content
        // This prevents secrets from being written to disk
      } else {
        // User explicitly edited the field - update the original content
        setByPtr(original, jsonPointer, value);
      }
    } else {
      // Not an environment-backed field or not a string - update normally
      setByPtr(original, jsonPointer, value);
    }

    sf.original = original;
    
    // Save the settings preserving environment variables
    const saveResult = saveSettingsPreservingEnv(sf);
    return saveResult;
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Save settings to disk while preserving environment variable placeholders
 * 
 * This function NEVER writes resolved secrets to disk. It only writes the
 * original structure with $VAR placeholders intact.
 * 
 * @param sf Settings file object
 * @returns SettingsResult indicating success/failure
 */
export function saveSettingsPreservingEnv(sf: SettingsFile): SettingsResult {
  try {
    // Never write resolved runtime view to disk
    // Always write the original structure with placeholders
    const text = JSON.stringify(sf.original ?? {}, null, 2);
    fs.writeFileSync(sf.path, text, "utf-8");
    
    return {
      success: true,
      preservedEnvVars: Array.from(sf.originEnvMap?.keys() ?? [])
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save settings"
    };
  }
}

/**
 * Force update a setting (bypasses environment variable preservation)
 * 
 * Use this when you explicitly want to override an environment variable
 * placeholder with a literal value.
 * 
 * @param sf Settings file object
 * @param jsonPointer JSON pointer to the value to set
 * @param value New value to set
 * @returns SettingsResult indicating success/failure
 */
export function forceSetValue(sf: SettingsFile, jsonPointer: string, value: Json): SettingsResult {
  try {
    // Update both resolved and original views
    setByPtr(sf.settings, jsonPointer, value);
    
    const original = deepClone(sf.original ?? {});
    setByPtr(original, jsonPointer, value);
    sf.original = original;
    
    // Remove from environment map since it's no longer env-backed
    sf.originEnvMap?.delete(jsonPointer);
    
    return saveSettingsPreservingEnv(sf);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Restore environment variable placeholder for a setting
 * 
 * This converts a literal value back to an environment variable placeholder.
 * 
 * @param sf Settings file object
 * @param jsonPointer JSON pointer to the value to restore
 * @param envVarName Environment variable name (without $ prefix)
 * @returns SettingsResult indicating success/failure
 */
export function restoreEnvPlaceholder(sf: SettingsFile, jsonPointer: string, envVarName: string): SettingsResult {
  try {
    const placeholder = `$${envVarName}`;
    
    // Update resolved view with current environment variable value
    const resolvedValue = process.env[envVarName] ?? placeholder;
    setByPtr(sf.settings, jsonPointer, resolvedValue);
    
    // Update original view with placeholder
    const original = deepClone(sf.original ?? {});
    setByPtr(original, jsonPointer, placeholder);
    sf.original = original;
    
    // Add to environment map
    if (!sf.originEnvMap) {
      sf.originEnvMap = new Map();
    }
    sf.originEnvMap.set(jsonPointer, placeholder);
    
    return saveSettingsPreservingEnv(sf);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
