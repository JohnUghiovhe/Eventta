import { SYSTEM_MESSAGES } from '../utils/systemMessages';

describe('SYSTEM_MESSAGES', () => {
  it('uses the Eventta brand across shared backend messages', () => {
    expect(SYSTEM_MESSAGES.appName).toBe('Eventta');
    expect(SYSTEM_MESSAGES.apiName).toBe('Eventta API');
    expect(SYSTEM_MESSAGES.apiDocumentationTitle).toContain('Eventta');
  });

  it('exposes the expected default runtime values', () => {
    expect(SYSTEM_MESSAGES.defaultMongoUri).toContain('eventta');
    expect(SYSTEM_MESSAGES.defaultApiBaseUrl).toContain('eventta');
    expect(SYSTEM_MESSAGES.email.welcomeSubject).toBe('Welcome to Eventta!');
  });
});