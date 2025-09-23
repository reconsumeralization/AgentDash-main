/**
 * Utility Functions for Secure Settings Management
 * 
 * This module provides utility functions for deep cloning and JSON pointer
 * operations used in secure settings management.
 * 
 * @author David Amber "WebDUH LLC" Weatherspoon
 * @security Critical - Prevents credential leakage in settings files
 */

/**
 * Deep clone an object using JSON serialization
 * 
 * @param x Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

/**
 * Set a value in an object using JSON pointer notation
 * 
 * @param obj Object to modify
 * @param ptr JSON pointer (e.g., "/api/key" or "/model/name")
 * @param value Value to set
 */
export function setByPtr(obj: any, ptr: string, value: any): void {
  const parts = ptr.split("/").slice(1).map(unescapePtr);
  
  if (parts.length === 0) {
    throw new Error("Invalid JSON pointer: must start with '/'");
  }
  
  let cur = obj;
  
  // Navigate to the parent of the target property
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] === undefined || cur[k] === null) {
      cur[k] = {};
    }
    cur = cur[k];
  }
  
  // Set the final value
  const finalKey = parts[parts.length - 1];
  cur[finalKey] = value;
}

/**
 * Get a value from an object using JSON pointer notation
 * 
 * @param obj Object to read from
 * @param ptr JSON pointer (e.g., "/api/key" or "/model/name")
 * @returns Value at the specified pointer, or undefined if not found
 */
export function getByPtr(obj: any, ptr: string): any {
  const parts = ptr.split("/").slice(1).map(unescapePtr);
  
  if (parts.length === 0) {
    return obj;
  }
  
  let cur = obj;
  
  for (const part of parts) {
    if (cur === undefined || cur === null) {
      return undefined;
    }
    cur = cur[part];
  }
  
  return cur;
}

/**
 * Check if a JSON pointer exists in an object
 * 
 * @param obj Object to check
 * @param ptr JSON pointer to check
 * @returns True if the pointer exists, false otherwise
 */
export function hasPtr(obj: any, ptr: string): boolean {
  return getByPtr(obj, ptr) !== undefined;
}

/**
 * Unescape JSON pointer special characters
 * 
 * @param s String to unescape
 * @returns Unescaped string
 */
function unescapePtr(s: string): string {
  return s.replace(/~1/g, "/").replace(/~0/g, "~");
}

/**
 * Escape a key for use in JSON pointer
 * 
 * @param key Key to escape
 * @returns Escaped key
 */
export function escapePtrKey(key: string): string {
  return key.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * Validate JSON pointer format
 * 
 * @param ptr JSON pointer to validate
 * @returns True if valid, false otherwise
 */
export function isValidJsonPointer(ptr: string): boolean {
  if (!ptr.startsWith("/")) {
    return false;
  }
  
  // Check for invalid characters
  if (ptr.includes("//")) {
    return false;
  }
  
  return true;
}

/**
 * Get all JSON pointers in an object
 * 
 * @param obj Object to traverse
 * @param prefix Prefix for the current path (used internally)
 * @returns Array of JSON pointers
 */
export function getAllPointers(obj: any, prefix: string = ""): string[] {
  const pointers: string[] = [];
  
  if (obj === null || obj === undefined) {
    return pointers;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const currentPtr = `${prefix}/${index}`;
      pointers.push(currentPtr);
      pointers.push(...getAllPointers(item, currentPtr));
    });
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach(key => {
      const currentPtr = `${prefix}/${escapePtrKey(key)}`;
      pointers.push(currentPtr);
      pointers.push(...getAllPointers(obj[key], currentPtr));
    });
  }
  
  return pointers;
}

/**
 * Check if two objects are deeply equal
 * 
 * @param a First object
 * @param b Second object
 * @returns True if objects are deeply equal, false otherwise
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }
  
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }
  
  if (typeof a !== typeof b) {
    return false;
  }
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {
      return false;
    }
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  return false;
}
