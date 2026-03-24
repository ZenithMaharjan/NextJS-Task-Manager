export type JobCardServiceType = "first_service" | "normal_service";

export interface JobCardCustomerDetails {
  name: string;
  address?: string;
  contactNo: string;
  emailId?: string;
}

export interface JobCardVehicleDetails {
  model: string;
  regdNo: string;
  dos?: string; // Date of Sale
  frameNo?: string;
  engineNo?: string;
}

export interface JobCard {
  id: string;
  jobCardNo: string;
  userId: string;
  date: string;
  timeIn: string;
  customer: JobCardCustomerDetails;
  vehicle: JobCardVehicleDetails;
  serviceType: JobCardServiceType;
  kmReading: number;
  customerComplaints: string[];
  observations: string[];
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface JobCardListResponse {
  success: boolean;
  data: JobCard[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateJobCardRequest {
  date: string;
  timeIn: string;
  customer: JobCardCustomerDetails;
  vehicle: JobCardVehicleDetails;
  serviceType: JobCardServiceType;
  kmReading: number;
  customerComplaints?: string[];
  observations?: string[];
  data?: Record<string, any>;
}
