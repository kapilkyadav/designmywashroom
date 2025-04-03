
import { LeadCrudService } from './LeadCrudService';
import { ActivityLogService } from './ActivityLogService';
import { LeadRemarksService } from './LeadRemarksService';
import { SyncConfigService } from './SyncConfigService';
import { SyncOperationsService } from './SyncOperationsService';
import { Lead, LeadFilter, LeadActivityLog, LeadRemark, LeadSyncConfig } from './types';

// Create a combined service that exports all functionality
export const LeadService = {
  // Re-export all methods from other services
  ...LeadCrudService,
  ...ActivityLogService,
  ...LeadRemarksService,
  ...SyncConfigService,
  ...SyncOperationsService
};

// Re-export types
export type {
  Lead,
  LeadFilter,
  LeadActivityLog, 
  LeadRemark,
  LeadSyncConfig
};
