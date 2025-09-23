// Override conflicting DOM types from @types/web
// This prevents conflicts with TypeScript's built-in DOM types

// Prevent @types/web from being loaded
declare module '@types/web' {
  // Empty module declaration to prevent conflicts
}

// Explicitly reference built-in DOM types to ensure they take precedence
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Override any conflicting type definitions that might come from @types/web
declare global {
  // Ensure we're using the built-in DOM types
  interface Window {
    // Use built-in Window interface
  }
  
  interface Document {
    // Use built-in Document interface
  }
  
  interface Element {
    // Use built-in Element interface
  }
}
