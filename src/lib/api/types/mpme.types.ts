export interface MPMEInscrit {
  id: number;
  applicationCode: string;
  companyName: string;
  representativeName: string;
  email: string;
  phone: string;
  sector: string;
  province: string;
  commune: string;
  registrationDate: string;
  status: 'Refugier' | 'Burundais' | '--';
  // status: 'pending' | 'validated' | 'rejected' | 'registered';
  profileCompletion: number;
  companyType?: string;
  nif?: string;
  employees?: number;
  isWomanLed?: boolean;
  isRefugeeLed?: boolean;
  gender?: 'Femme' | 'Homme' | '--';
}

export interface MPMECandidature {
  id: number;
  applicationCode: string;
  companyName: string;
  companyType: string;
  province: string;
  commune: string;
  totalProjectCost: number;
  mainExpenses: string;
  legalStatus: string;
  creationDate: string;
  sector: string;
  representativeName: string;
  email: string;
  phone: string;
  gender: 'Femme' | 'Homme' | '--';
  projectTitle: string;
  projectSector: string;
  requestedAmount: number;
  submissionDate: string;
  status: string;
  score?: number;
  evaluationComments?: string;
  businessPlanUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMPMEInscrits {
  data: MPMEInscrit[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedMPMECandidatures {
  data: MPMECandidature[];
  meta: PaginationMeta;
}

export interface MPMEFilters {
  page?:             number;
  limit?:            number;
  search?:           string;

  // Statut & catégorie
  statusId?:         string;
  category?:         string;   // BURUNDIAN | REFUGEE

  // Démographie
  gender?:           string;   // H | F
  provinceId?:       number;

  // Entreprise
  companyType?:      string;   // formal | informal | project
  legalStatus?:      string;
  sector?:           string;
  isWomanLed?:       boolean;
  isRefugeeLed?:     boolean;
  hasClimateImpact?: boolean;

  // Financement
  amountRange?:      string;   // ex. "1000000-5000000"
  minAmount?:        number;
  maxAmount?:        number;

  // Complétion
  minCompletion?:    string | number;
  isProfileComplete?: boolean;

  // Dates
  fromDate?:         string;
  toDate?:           string;
}

export interface MPMECandidatureDetails {
  id: number;
  uuid: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string;
    gender: { code: string };
    primaryAddress: {
      id: number;
      provinceId: number;
      province: string;
      communeId: number;
      commune: string;
      neighborhood: string | null;
      street: string | null;
      hill: string | null;
    };
    consents: Array<{
      type: string;
      value: boolean;
      givenAt: string;
    }>;
  };
  position: string | null;
  maritalStatus: string | null;
  educationLevel: string | null;
  category: string;
  eligibilityQuestions: {
    isPublicServant: boolean | null;
    isRelativeOfPublicServant: boolean | null;
    isPublicIntern: boolean | null;
    isRelativeOfPublicIntern: boolean | null;
    wasHighOfficer: boolean | null;
    isRelativeOfHighOfficer: boolean | null;
    hasProjectLink: boolean | null;
    isDirectSupplierToProject: boolean | null;
    hasPreviousGrant: boolean | null;
    previousGrantDetails: string | null;
  };
  company: {
    id: number;
    companyName: string;
    companyType: string;
    taxIdNumber: string;
    registrationNumber: string | null;
    legalStatus: string | null;
    legalStatusOther: string | null;
    creationDate: string;
    activityDescription: string;
    permanentEmployees: number;
    totalEmployees: number | null;
    revenueYearN1: string;
    primarySector: { id: number; name: string };
    otherCompanySector: string | null;
    address: any;
    companyAddressIsDifferent: boolean | null;
    companyPhone: string | null;
    companyEmail: string | null;
    supportService: boolean;
    employees: {
      female: number;
      male: number;
      refugee: number;
      batwa: number;
      disabled: number;
      albinos: number;
      repatriates: number;
      partTime: number;
      permanent: number;
    };
    associates: {
      count: string | null;
      countOther: string | null;
      partners: {
        female: number;
        male: number;
        refugee: number;
        batwa: number;
        disabled: number;
        albinos: number;
        repatriates: number;
      };
    };
    finances: {
      hasBankAccount: boolean | null;
      hasBankCredit: boolean | null;
      bankCreditAmount: number | null;
      annualRevenue: string;
    };
    socialImpact: {
      isLedByWoman: boolean;
      isLedByRefugee: boolean;
      hasPositiveClimateImpact: boolean;
    };
  };
  project: {
    title: string | null;
    objective: string | null;
    sectors: string[] | null;
    otherSector: string | null;
    mainActivities: string | null;
    productsServices: string | null;
    businessIdea: string | null;
    targetClients: string | null;
    clientScope: string[] | null;
    competition: {
      hasCompetitors: boolean | null;
      competitorNames: string | null;
    };
    plannedEmployees: {
      female: number;
      male: number;
      permanent: number;
      refugee: number;
      batwa: number;
      disabled: number;
      albinos: number;
      repatriates: number;
      partTime: number;
    };
    innovation: {
      isNewIdea: boolean | null;
      ideaTested: boolean | null;
    };
    impact: {
      climateActions: string | null;
      inclusionActions: string | null;
    };
    financing: {
      hasEstimatedCost: boolean | null;
      totalCost: number | null;
      requestedSubsidy: number | null;
      mainExpenses: string | null;
    };
  };
  documents: any[];
  documentsByKey: Record<string, any>;
  status: { code: string; name: string };
  profileCompletionPercentage: string;
  profileCompletionStep: string;
  isProfileComplete: boolean;
  applicationCode: string | null;
  applicationSubmittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  copaEdition: any;
}