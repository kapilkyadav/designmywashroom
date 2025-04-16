
import { z } from 'zod';

// Project info step schema
export const projectInfoSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email().optional().or(z.literal('')),
  client_mobile: z.string().min(1, "Mobile number is required"),
  client_location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  floor_number: z.string().optional(),
  service_lift_available: z.boolean().default(false),
  project_type: z.string().min(1, "Project type is required"),
  selected_brand: z.string().optional(),
});

export type ProjectInfoValues = z.infer<typeof projectInfoSchema>;

// Define the type for a service detail
export interface ServiceDetail {
  serviceId: string;
  serviceName: string;
  unit?: string;
  categoryName?: string;
}

// Define the type for a washroom with calculated areas
export interface WashroomWithAreas {
  id?: string;
  name: string;
  length: number;
  width: number;
  height: number;
  floorArea: number;
  wallArea: number;
  ceilingArea: number;
  services: Record<string, boolean>;
  service_details?: Record<string, ServiceDetail[]>;
  selected_brand?: string;
}

export type WizardStep = 'project-info' | 'washrooms' | 'washroom-scope' | 'summary';
