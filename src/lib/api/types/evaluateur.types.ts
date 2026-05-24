export interface Evaluator {
  id: number;
  userId: number;
  user: { id: number; firstName: string; lastName: string; email: string };
  expertise: string | null;
  isIndependent: boolean;
  isActive: boolean;
  validatedAt: string | null;
  createdAt: string;
}

export interface EvaluationAssignment {
  id: number;
  businessPlanId: number;
  evaluatorId: number;
  businessPlan: {
    id: number;
    beneficiary: { id: number; user: { firstName: string; lastName: string } };
  };
  evaluator: { id: number; user: { firstName: string; lastName: string } };
  deadline: string | null;
  status: string;
  assignedAt: string;
}

export interface Evaluation {
  id: number;
  businessPlanId: number;
  evaluatorId: number;
  assignmentId?: number;
  economicViabilityScore: number;
  innovationScore: number;
  qualityScore: number;
  implementationCapacityScore: number;
  socialImpactScore: number;
  environmentalImpactScore: number;
  totalScore: number;
  recommendation: string;
  globalComment?: string;
  strengths?: string;
  weaknesses?: string;
  evaluationDate: string;
  isFinalEvaluation: boolean;
  evaluator?: { id: number; user: { firstName: string; lastName: string } };
}

export type RecommendationCode =
  | 'STRONGLY_RECOMMENDED'
  | 'RECOMMENDED'
  | 'RECOMMENDED_WITH_RESERVES'
  | 'NOT_RECOMMENDED';

export interface EvaluationInput {
  businessPlanId: number;
  economicViabilityScore: number;
  innovationScore: number;
  qualityScore: number;
  implementationCapacityScore: number;
  socialImpactScore: number;
  environmentalImpactScore: number;
  recommendation: RecommendationCode;
  conflictOfInterestDeclared: boolean;
  globalComment?: string;
  strengths?: string;
  weaknesses?: string;
}

export const SCORE_CRITERIA: {
  key: keyof EvaluationInput;
  label: string;
  description: string;
  max: number;
}[] = [
  { key: 'economicViabilityScore',        label: 'Viabilité économique',      description: 'Rentabilité, marché cible, projections financières',      max: 25 },
  { key: 'innovationScore',               label: 'Innovation',                description: 'Originalité, différenciation par rapport aux concurrents', max: 20 },
  { key: 'qualityScore',                  label: 'Qualité du plan',           description: 'Clarté, cohérence et complétude du dossier',              max: 15 },
  { key: 'implementationCapacityScore',   label: 'Capacité de mise en œuvre', description: "Compétences de l'équipe, ressources disponibles",         max: 20 },
  { key: 'socialImpactScore',             label: 'Impact social',             description: "Création d'emplois, inclusion, impact sur la communauté",  max: 10 },
  { key: 'environmentalImpactScore',      label: 'Impact environnemental',    description: 'Pratiques durables, empreinte écologique',                 max: 10 },
];
