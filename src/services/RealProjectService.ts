
// Re-export from the new modular service
export * from './real-projects';

// Also export the individual services to make them directly available
export { WashroomService } from './real-projects/WashroomService';
export { QuotationService } from './real-projects/QuotationService';

