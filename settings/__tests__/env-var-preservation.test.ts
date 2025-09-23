/**
 * Security Tests for Environment Variable Preservation
 * 
 * These tests ensure that the secure settings patch prevents secret leakage
 * while maintaining proper functionality.
 * 
 * @author David Amber "WebDUH LLC" Weatherspoon
 * @security Critical - Tests prevent credential leakage in settings files
 */

import fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadSettingsFile, validateSettingsFile } from '../load';
import { setValue, saveSettingsPreservingEnv, forceSetValue, restoreEnvPlaceholder } from '../set';
import { deepClone, setByPtr, getByPtr, hasPtr, getAllPointers, deepEqual } from '../util';

// Mock environment variables for testing
const originalEnv = process.env;

describe('Environment Variable Preservation Security Tests', () => {
  let tempDir: string;
  let testSettingsPath: string;

  beforeEach(() => {
    // Set up test environment variables
    process.env = {
      ...originalEnv,
      API_KEY: 'sk-test-123-secret-key',
      DB_PASS: 'super-secret-password',
      JWT_SECRET: 'jwt-secret-token-456',
      OPENAI_API_KEY: 'sk-openai-test-789'
    };

    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(join(tmpdir(), 'gemini-cli-test-'));
    testSettingsPath = join(tempDir, 'settings.json');
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    
    // Clean up test files
    if (fs.existsSync(testSettingsPath)) {
      fs.unlinkSync(testSettingsPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
  });

  describe('loadSettingsFile', () => {
    test('should load settings with environment variable provenance tracking', () => {
      const settingsContent = {
        api: { key: '$API_KEY' },
        database: { password: '${env:DB_PASS}' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      
      const sf = loadSettingsFile(testSettingsPath);
      
      expect(sf.settings.api.key).toBe('sk-test-123-secret-key');
      expect(sf.settings.database.password).toBe('super-secret-password');
      expect(sf.settings.model.name).toBe('gemini-pro');
      
      expect(sf.originEnvMap?.has('/api/key')).toBe(true);
      expect(sf.originEnvMap?.has('/database/password')).toBe(true);
      expect(sf.originEnvMap?.get('/api/key')).toBe('$API_KEY');
      expect(sf.originEnvMap?.get('/database/password')).toBe('$DB_PASS');
    });

    test('should handle missing environment variables gracefully', () => {
      const settingsContent = {
        api: { key: '$MISSING_VAR' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      
      const sf = loadSettingsFile(testSettingsPath);
      
      expect(sf.settings.api.key).toBe('$MISSING_VAR');
      expect(sf.originEnvMap?.has('/api/key')).toBe(true);
    });
  });

  describe('setValue security', () => {
    test('changing unrelated field does not leak secrets', () => {
      const settingsContent = {
        api: { key: '$API_KEY' },
        database: { password: '${env:DB_PASS}' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      // Change an unrelated field
      const result = setValue(sf, '/model/name', 'gemini-pro-vision');
      
      expect(result.success).toBe(true);
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toMatch(/\$API_KEY/);
      expect(written).toMatch(/\${env:DB_PASS}/);
      expect(written).not.toMatch(/sk-test-123/);
      expect(written).not.toMatch(/super-secret/);
    });

    test('explicitly editing an env-backed field replaces placeholder', () => {
      const settingsContent = {
        api: { key: '$API_KEY' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      // Explicitly edit the API key
      const result = setValue(sf, '/api/key', 'override-key');
      
      expect(result.success).toBe(true);
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toContain('override-key');
      expect(written).not.toContain('$API_KEY');
    });

    test('preserves environment variables when setting resolved values', () => {
      const settingsContent = {
        api: { key: '$API_KEY' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      // Set the resolved value (should preserve placeholder)
      const result = setValue(sf, '/api/key', 'sk-test-123-secret-key');
      
      expect(result.success).toBe(true);
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toContain('$API_KEY');
      expect(written).not.toContain('sk-test-123-secret-key');
    });
  });

  describe('saveSettingsPreservingEnv', () => {
    test('never writes resolved secrets to disk', () => {
      const settingsContent = {
        api: { key: '$API_KEY' },
        database: { password: '${env:DB_PASS}' },
        jwt: { secret: '${env:JWT_SECRET}' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      const result = saveSettingsPreservingEnv(sf);
      
      expect(result.success).toBe(true);
      expect(result.preservedEnvVars).toContain('/api/key');
      expect(result.preservedEnvVars).toContain('/database/password');
      expect(result.preservedEnvVars).toContain('/jwt/secret');
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toMatch(/\$API_KEY/);
      expect(written).toMatch(/\${env:DB_PASS}/);
      expect(written).toMatch(/\${env:JWT_SECRET}/);
      expect(written).not.toMatch(/sk-test-123/);
      expect(written).not.toMatch(/super-secret/);
      expect(written).not.toMatch(/jwt-secret-token/);
    });
  });

  describe('forceSetValue', () => {
    test('overrides environment variable placeholder with literal value', () => {
      const settingsContent = {
        api: { key: '$API_KEY' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      const result = forceSetValue(sf, '/api/key', 'literal-api-key');
      
      expect(result.success).toBe(true);
      expect(sf.originEnvMap?.has('/api/key')).toBe(false);
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toContain('literal-api-key');
      expect(written).not.toContain('$API_KEY');
    });
  });

  describe('restoreEnvPlaceholder', () => {
    test('converts literal value back to environment variable placeholder', () => {
      const settingsContent = {
        api: { key: 'literal-key' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      const result = restoreEnvPlaceholder(sf, '/api/key', 'API_KEY');
      
      expect(result.success).toBe(true);
      expect(sf.originEnvMap?.has('/api/key')).toBe(true);
      expect(sf.originEnvMap?.get('/api/key')).toBe('$API_KEY');
      expect(sf.settings.api.key).toBe('sk-test-123-secret-key');
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toContain('$API_KEY');
      expect(written).not.toContain('literal-key');
    });
  });

  describe('validateSettingsFile', () => {
    test('should detect leaked secrets in settings file', () => {
      const settingsWithSecrets = {
        api: { key: 'sk-test-123-secret-key' },
        database: { password: 'super-secret-password' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsWithSecrets, null, 2));
      
      expect(validateSettingsFile(testSettingsPath)).toBe(false);
    });

    test('should pass validation for files with placeholders', () => {
      const settingsWithPlaceholders = {
        api: { key: '$API_KEY' },
        database: { password: '${env:DB_PASS}' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsWithPlaceholders, null, 2));
      
      expect(validateSettingsFile(testSettingsPath)).toBe(true);
    });
  });

  describe('utility functions', () => {
    test('deepClone should create independent copies', () => {
      const original = { api: { key: '$API_KEY' }, model: { name: 'test' } };
      const cloned = deepClone(original);
      
      expect(deepEqual(original, cloned)).toBe(true);
      
      cloned.api.key = 'modified';
      expect(original.api.key).toBe('$API_KEY');
      expect(cloned.api.key).toBe('modified');
    });

    test('setByPtr should set values at JSON pointers', () => {
      const obj = { api: { key: 'old' }, model: { name: 'test' } };
      
      setByPtr(obj, '/api/key', 'new');
      setByPtr(obj, '/model/version', '1.0');
      
      expect(obj.api.key).toBe('new');
      expect(obj.model.version).toBe('1.0');
    });

    test('getByPtr should retrieve values at JSON pointers', () => {
      const obj = { api: { key: '$API_KEY' }, model: { name: 'test' } };
      
      expect(getByPtr(obj, '/api/key')).toBe('$API_KEY');
      expect(getByPtr(obj, '/model/name')).toBe('test');
      expect(getByPtr(obj, '/nonexistent')).toBe(undefined);
    });

    test('hasPtr should check if JSON pointer exists', () => {
      const obj = { api: { key: '$API_KEY' }, model: { name: 'test' } };
      
      expect(hasPtr(obj, '/api/key')).toBe(true);
      expect(hasPtr(obj, '/model/name')).toBe(true);
      expect(hasPtr(obj, '/nonexistent')).toBe(false);
    });

    test('getAllPointers should return all JSON pointers in object', () => {
      const obj = { api: { key: '$API_KEY' }, model: { name: 'test' } };
      const pointers = getAllPointers(obj);
      
      expect(pointers).toContain('/api');
      expect(pointers).toContain('/api/key');
      expect(pointers).toContain('/model');
      expect(pointers).toContain('/model/name');
    });
  });

  describe('complex scenarios', () => {
    test('should handle nested arrays with environment variables', () => {
      const settingsContent = {
        models: [
          { name: 'gemini-pro', apiKey: '$API_KEY' },
          { name: 'gpt-4', apiKey: '${env:OPENAI_API_KEY}' }
        ],
        database: { password: '${env:DB_PASS}' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      expect(sf.settings.models[0].apiKey).toBe('sk-test-123-secret-key');
      expect(sf.settings.models[1].apiKey).toBe('sk-openai-test-789');
      expect(sf.settings.database.password).toBe('super-secret-password');

      // Change an unrelated field
      setValue(sf, '/models/0/name', 'gemini-pro-vision');
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toMatch(/\$API_KEY/);
      expect(written).toMatch(/\${env:OPENAI_API_KEY}/);
      expect(written).toMatch(/\${env:DB_PASS}/);
      expect(written).not.toMatch(/sk-test-123/);
      expect(written).not.toMatch(/sk-openai-test/);
      expect(written).not.toMatch(/super-secret/);
    });

    test('should handle mixed literal and environment variable values', () => {
      const settingsContent = {
        api: { key: '$API_KEY' },
        database: { password: 'hardcoded-password' },
        model: { name: 'gemini-pro' }
      };

      fs.writeFileSync(testSettingsPath, JSON.stringify(settingsContent, null, 2));
      const sf = loadSettingsFile(testSettingsPath);

      // Change the hardcoded password
      setValue(sf, '/database/password', 'new-password');
      
      const written = fs.readFileSync(testSettingsPath, 'utf-8');
      expect(written).toMatch(/\$API_KEY/);
      expect(written).toContain('new-password');
      expect(written).not.toContain('hardcoded-password');
      expect(written).not.toMatch(/sk-test-123/);
    });
  });
});
