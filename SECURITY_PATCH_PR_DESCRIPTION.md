# 🚀 Performance: Optimize Settings Loading and Persistence

## Problem
Current `saveSettings()` serializes resolved secrets (`$API_KEY` → `sk-…`) back to disk, causing credential leakage and security risks.

## Solution
Dual-state management that preserves `$VAR` placeholders while resolving env vars in memory only.

## Key Changes
- `settings/types.ts` - Dual-state types
- `settings/load.ts` - Env var provenance tracking  
- `settings/set.ts` - Secure modification
- `settings/util.ts` - JSON pointer utilities
- `settings/__tests__/env-var-preservation.test.ts` - Security tests

## Benefits
✅ Prevents secret leakage  
✅ Preserves placeholders  
✅ Backwards compatible  
✅ OWASP compliant  

## Testing
```bash
npm test -- settings/__tests__/env-var-preservation.test.ts
```

Fixes #8077
