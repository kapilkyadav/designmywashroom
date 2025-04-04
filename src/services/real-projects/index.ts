
import { ProjectService } from './ProjectService';
import { ConversionService } from './ConversionService';
import { WashroomService } from './WashroomService';
import { QuotationService } from './QuotationService';
import { CostingService } from './CostingService';
import { RealProject, RealProjectFilter, ConvertibleRecord, ProjectQuotation, Washroom } from './types';
import { BaseService, RealProjectService as BaseRealProjectService } from './BaseService';

export * from './types';

// Create a unified service by combining all the specialized services
export class RealProjectService {
  // Project Service Methods
  static getRealProjects = ProjectService.getRealProjects;
  static getRealProject = ProjectService.getRealProject;
  static updateRealProject = ProjectService.updateRealProject;
  static deleteRealProject = ProjectService.deleteRealProject;
  static createRealProject = ProjectService.createRealProject;
  
  // Washroom Service Methods
  static addWashroomToProject = WashroomService.addWashroomToProject;
  static getProjectWashrooms = WashroomService.getProjectWashrooms;
  static updateProjectWashrooms = WashroomService.updateProjectWashrooms;
  
  // Conversion Service Methods
  static getConvertibleRecords = ConversionService.getConvertibleRecords;
  static convertToProject = ConversionService.convertToProject;
  static convertLeadToRealProject = ConversionService.convertLeadToRealProject;
  static convertEstimateToRealProject = ConversionService.convertEstimateToRealProject;
  
  // Quotation Service Methods
  static generateQuotation = QuotationService.generateQuotation;
  static getProjectQuotations = QuotationService.getProjectQuotations;
  static getQuotation = QuotationService.getQuotation;
  
  // Costing Service Methods
  static getExecutionServices = CostingService.getExecutionServices;
  static getTilingRates = CostingService.getTilingRates;
  static calculateProjectCosts = CostingService.calculateProjectCosts;
  
  // Make BaseService.extendRealProject public through our service interface
  static extendRealProject(project: RealProject): RealProject {
    return BaseService.extendRealProject(project);
  }
}

// Update the BaseService RealProjectService reference to resolve circular dependency
BaseRealProjectService.updateRealProject = ProjectService.updateRealProject;
