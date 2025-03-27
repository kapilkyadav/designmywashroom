
// Re-export from the new module structure
import { fixtureService } from './fixtures/FixtureService';

// Export the singleton instance as the default export
export const FixtureService = fixtureService;

// Also export the class for type usage
export { FixtureService as FixtureServiceClass } from './fixtures/FixtureService';
export { FixtureCache } from './fixtures/FixtureCache';
export { FixtureRepository } from './fixtures/FixtureRepository';
