import { apiClient } from '../client/base-client';
import type {
  MPMEInscrit,
  MPMECandidature,
  PaginatedMPMEInscrits,
  PaginatedMPMECandidatures,
  MPMEFilters,
  MPMECandidatureDetails,
} from '../types/mpme.types';

function toQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

class MPMEApi {
  private readonly base = '/beneficiaries';

  // ─── MPME Inscrits (Bénéficiaires) ─────────────────────────────────────────

  /**
   * Récupérer la liste des MPME inscrits (bénéficiaires)
   */
  async getInscrits(filters: MPMEFilters = {}): Promise<PaginatedMPMEInscrits> {
    const qs = toQueryString(filters);
    const response = await apiClient.get(`${this.base}${qs}`);

    // Transformer les données pour correspondre au format attendu
    return {
      data: response.data.map((item: any) => this.mapBeneficiaryToMPMEInscrit(item)),
      meta: response.meta
    };
  }

  /**
   * Récupérer un MPME inscrit par son ID
   */
  async getInscritById(id: number): Promise<MPMEInscrit> {
    const response = await apiClient.get(`${this.base}/${id}`);
    return this.mapBeneficiaryToMPMEInscrit(response);
  }

  // ─── MPME Candidatures (Plans d'affaires) ────────────────────────────────────

  /**
   * Récupérer la liste des candidatures (business plans des bénéficiaires)
   */
  async getCandidatures(filters: MPMEFilters = {}): Promise<PaginatedMPMECandidatures> {
    const qs = toQueryString(filters);
    const response = await apiClient.get(`${this.base}${qs}`);

    // Filtrer uniquement les bénéficiaires qui ont soumis un projet
    // const candidatures = response.data.filter((item: any) => 
    //   item.projectTitle || item.applicationSubmittedAt
    // );

    return {
      data: response.data.map((item: any) => this.mapBeneficiaryToCandidature(item)),
      meta: response.meta
    };
  }

  /**
   * Récupérer une candidature par son ID
   */
  async getCandidatureById(id: number): Promise<MPMECandidatureDetails> {
    const response = await apiClient.get(`${this.base}/${id}/candidature`);
    return response;
  }

  /**
   * Évaluer une candidature
   */
  async evaluateCandidature(id: number, evaluation: { score: number; comments: string }): Promise<MPMECandidature> {
    // Vous devez créer un endpoint d'évaluation
    const response = await apiClient.post(`${this.base}/${id}/evaluate`, evaluation);
    return this.mapBeneficiaryToCandidature(response);
  }

  async selectBeneficiary(id: number, comment: string): Promise<MPMECandidature> {
    const response = await apiClient.post(`${this.base}/${id}/select`, { comment });
    return this.mapBeneficiaryToCandidature(response);
  }

  async rejectBeneficiary(id: number, comment: string): Promise<MPMECandidature> {
    const response = await apiClient.post(`${this.base}/${id}/reject`, { comment });
    return this.mapBeneficiaryToCandidature(response);
  }

  async approveBeneficiary(id: number): Promise<MPMECandidature> {
    const response = await apiClient.post(`${this.base}/${id}/approve`);
    return this.mapBeneficiaryToCandidature(response);
  }

  async preselectBeneficiary(id: number, comment: string): Promise<MPMECandidature> {
    const response = await apiClient.post(`${this.base}/${id}/preselect`, { comment });
    return this.mapBeneficiaryToCandidature(response);
  }

  // ─── Mappeurs ────────────────────────────────────────────────────────────────

  private mapBeneficiaryToMPMEInscrit(beneficiary: any): MPMEInscrit {
    return {
      id: beneficiary.id,
      applicationCode: beneficiary.applicationCode || `BEN-${beneficiary.id}`,
      companyName: beneficiary.company?.companyName || '--',
      representativeName: `${beneficiary.user?.firstName || ''} ${beneficiary.user?.lastName || ''}`.trim() || '--',
      email: beneficiary.user?.email || '--',
      phone: beneficiary.user?.phoneNumber || '--',
      sector: beneficiary.company?.primarySector?.nameFr || beneficiary.company?.otherCompanySector || '--',
      province: beneficiary.user?.primaryAddress?.commune?.province?.name || '--',
      commune: beneficiary.user?.primaryAddress?.commune?.name || '--',
      registrationDate: beneficiary.createdAt,
      status: this.mapCategories(beneficiary.category),
      profileCompletion: beneficiary.profileCompletionPercentage || 0,
      companyType: beneficiary.companyType || beneficiary.company?.companyType,
      nif: beneficiary.company?.taxIdNumber,
      employees: beneficiary.company?.permanentEmployees,
      isWomanLed: beneficiary.company?.isLedByWoman,
      isRefugeeLed: beneficiary.company?.isLedByRefugee,
      gender: beneficiary.user?.gender?.code === 'F' ? 'Femme' : beneficiary.user?.gender?.code === 'M' ? 'Homme' : '--',
    };
  }

  private mapBeneficiaryToCandidature(beneficiary: any): MPMECandidature {
    return {
      id: beneficiary.id,
      applicationCode: beneficiary.applicationCode || `CAN-${beneficiary.id}`,
      companyName: beneficiary?.company?.companyName || '--',
      province: beneficiary.user?.primaryAddress?.commune?.province?.name || '--',
      companyType: beneficiary.company?.companyType === 'formal' ? 'Formel' : beneficiary.company?.companyType === 'informal' ? 'Informel' : '--',
      legalStatus: this.mapLegalStatus(beneficiary.company?.legalStatus || beneficiary.company?.legalStatusOther),
      creationDate: beneficiary.company?.creationDate || '--',
      sector: beneficiary?.company?.primarySector?.nameFr || beneficiary.company?.otherCompanySector || '--',
      representativeName: `${beneficiary.user?.firstName || ''} ${beneficiary.user?.lastName || ''}`.trim() || '--',
      email: beneficiary.user?.email || '--',
      phone: beneficiary.user?.phoneNumber || '--',
      projectTitle: beneficiary.projectTitle || '--',
      projectSector: beneficiary.projectSectors?.join(', ') || beneficiary.otherSector || '--',
      requestedAmount: beneficiary.requestedSubsidyAmount || 0,
      totalProjectCost: beneficiary.totalProjectCost || 0,
      mainExpenses: beneficiary.mainExpenses || '--',
      submissionDate: beneficiary.applicationSubmittedAt || beneficiary.updatedAt,
      status: beneficiary.status?.code,
      score: beneficiary.evaluationScore,
      evaluationComments: beneficiary.evaluationComments,
      businessPlanUrl: beneficiary.businessPlan?.filePath,
      createdAt: beneficiary.createdAt,
      updatedAt: beneficiary.updatedAt,
      gender: beneficiary.user?.gender?.code === 'F' ? 'Femme' : beneficiary.user?.gender?.code === 'M' ? 'Homme' : '--',
    };
  }

  private mapLegalStatus(legalStatus?: string): string {
     switch (legalStatus) {
      case 'php': return 'Personne physique';
      case 'snc': return 'Société en Nom Collectif (SNC)';
      case 'sprl': return 'Société de Personnes à Responsabilité Limitée (SPRL)';
      case 'scs': return 'Société en Commandite Simple (SCS)';
      case 'su': return 'Société Unipersonnelle (SU)';
      case 'sa': return 'Société Anonyme (SA)';
      case 'coop': return 'Société Coopérative';
      default: return legalStatus || '--';
    
    }
  }

  private mapStatus(statusCode?: string): 'pending' | 'validated' | 'rejected' | 'registered' {
    switch (statusCode) {
      case 'VALIDATED': return 'validated';
      case 'REJECTED': return 'rejected';
      case 'REGISTERED': return 'registered';
      default: return 'pending';
    }
  }

  private mapCategories(categoryCodes?: string): 'Refugier' | 'Burundais' | '--' {
    switch (categoryCodes) {
      case 'REFUGEE': return 'Refugier';
      case 'BURUNDIAN': return 'Burundais';
      default: return '--';
    }
  }

  private mapCandidatureStatus(statusCode?: string): 'submitted' | 'under_review' | 'preselected' | 'selected' | 'rejected' {
    switch (statusCode) {
      case 'PRESELECTED': return 'preselected';
      case 'SELECTED': return 'selected';
      case 'REJECTED': return 'rejected';
      case 'UNDER_REVIEW': return 'under_review';
      default: return 'submitted';
    }
  }
}

export const mpmeApi = new MPMEApi();