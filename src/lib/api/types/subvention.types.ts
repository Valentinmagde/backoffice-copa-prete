export interface SubventionTranche {
  id: number;
  trancheNumber: number;
  amount: number;
  percentage: number;
  releaseCondition: string | null;
  plannedDate: string | null;
  status: string;
  effectiveReleaseDate: string | null;
  releasedByUserId: number | null;
}

export interface Subvention {
  id: number;
  agreementNumber: string;
  businessPlanId: number;
  beneficiaryId: number;
  beneficiary: { id: number; user: { firstName: string; lastName: string; email: string } };
  businessPlan: { id: number; title?: string };
  awardedAmount: number;
  counterpartAmount: number | null;
  signatureDate: string;
  startDate: string | null;
  plannedEndDate: string | null;
  status: { code: string; name: string } | null;
  agreementFileUrl: string | null;
  tranches: SubventionTranche[];
  createdAt: string;
}
