import { apiClient } from '../client/base-client';

export interface BusinessPlan {
  id: number;
  referenceNumber: string;
  isAnonymized?: boolean;
  projectTitle: string;
  projectDescription: string | null;
  requestedFundingAmount: number | null;
  personalContributionAmount: number | null;
  expectedJobsCount: number | null;
  expectedWomenJobsCount: number | null;
  status: { id: number; code: string; name: string } | null;
  copaEdition: { id: number; name: string } | null;
  businessSector: { id: number; name: string } | null;
  beneficiaryId: number;
  beneficiary?: {
    id: number;
    applicationCode?: string | null;
    projectSectors?: string[] | null;
    requestedSubsidyAmount?: number | null;
    totalProjectCost?: number | null;
    plannedEmployeesFemale?: number | null;
    plannedEmployeesMale?: number | null;
    user: { firstName: string; lastName: string; email: string } | null;
  } | null;
  submittedAt: string | null;
  createdAt: string;
  sections?: BusinessPlanSection[];
}

export interface BusinessPlansResponse {
  data: BusinessPlan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface BusinessPlanSection {
  id: number;
  sectionType: { id: number; name: string; code: string } | null;
  content: string | null;
  sectionOrder: number;
}

export interface BusinessPlanDocument {
  id: number;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSizeBytes: number | null;
  mimeType: string | null;
  uploadedAt: string;
  validationStatus: string;
  documentType?: { id: number; name: string; code: string } | null;
}

class BusinessPlanApi {
  private readonly base = '/business-plans';

  async getAll(params?: { search?: string; page?: number; limit?: number; statusId?: number }): Promise<BusinessPlansResponse> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.statusId) qs.set('statusId', String(params.statusId));
    return apiClient.get<BusinessPlansResponse>(`${this.base}?${qs.toString()}`);
  }

  async getByBeneficiary(beneficiaryId: number): Promise<BusinessPlan | null> {
    const res = await apiClient.get<BusinessPlansResponse>(
      `${this.base}?beneficiaryId=${beneficiaryId}&limit=1`
    );
    return res?.data?.[0] ?? null;
  }

  async getById(id: number): Promise<BusinessPlan> {
    return apiClient.get<BusinessPlan>(`${this.base}/${id}`);
  }

  async getDocument(id: number): Promise<BusinessPlanDocument | null> {
    return apiClient.get<BusinessPlanDocument | null>(`${this.base}/${id}/document`);
  }

  async anonymize(id: number): Promise<BusinessPlan> {
    return apiClient.patch<BusinessPlan>(`${this.base}/${id}/anonymize`, {});
  }
}

export const businessPlanApi = new BusinessPlanApi();
