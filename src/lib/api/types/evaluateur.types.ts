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
  criterion1Score: number;
  criterion2Score: number;
  criterion3Score: number;
  criterion4Score: number;
  criterion5Score: number;
  criterion6Score: number;
  criterion7Score: number;
  criterion8Score: number;
  criterion9Score: number;
  criterion10Score: number;
  criterion11Score: number;
  criterion12Score: number;
  criterion13Score: number;
  criterion14Score: number;
  criterion15Score: number;
  criterion16Score: number;
  totalScore: number;
  recommendation: string;
  globalComment?: string;
  evaluationDate: string;
  isFinalEvaluation: boolean;
  criteriaComments?: Record<string, string>;
  evaluator?: { id: number; user: { firstName: string; lastName: string } };
  businessPlan?: {
    id: number;
    referenceNumber?: string;
    projectTitle?: string;
    beneficiary?: {
      id: number;
      totalProjectCost?: number | null;
      requestedSubsidyAmount?: number | null;
      user?: { firstName: string; lastName: string };
    };
  };
}

export type RecommendationCode =
  | 'STRONGLY_RECOMMENDED'
  | 'RECOMMENDED'
  | 'RECOMMENDED_WITH_RESERVES'
  | 'NOT_RECOMMENDED';

export interface EvaluationInput {
  businessPlanId: number;
  criterion1Score: number;
  criterion2Score: number;
  criterion3Score: number;
  criterion4Score: number;
  criterion5Score: number;
  criterion6Score: number;
  criterion7Score: number;
  criterion8Score: number;
  criterion9Score: number;
  criterion10Score: number;
  criterion11Score: number;
  criterion12Score: number;
  criterion16Score: number;
  criterion13Score: number;
  criterion14Score: number;
  criterion15Score: number;
  recommendation?: RecommendationCode;
  conflictOfInterestDeclared: boolean;
  globalComment?: string;
  criteriaComments?: Record<string, string>;
}

export interface EvaluationCriterion {
  key: keyof EvaluationInput;
  num: number;
  label: string;
  coefficient: number;
  section: string;
  binaryOnly?: boolean;
}

export const SCORE_CRITERIA: EvaluationCriterion[] = [
  // A. L'objectif et l'idée de projet
  { key: 'criterion1Score',  num: 1,  section: "A. L'objectif et l'idée de projet",              label: "L'objectif de l'entreprise est SMART",                                                                                             coefficient: 2 },
  { key: 'criterion2Score',  num: 2,  section: "A. L'objectif et l'idée de projet",              label: "L'idée de projet est innovante",                                                                                                    coefficient: 2 },
  { key: 'criterion3Score',  num: 3,  section: "A. L'objectif et l'idée de projet",              label: "La genèse du projet est originale",                                                                                                 coefficient: 2 },
  // B. Stratégie et plan marketing
  { key: 'criterion4Score',  num: 4,  section: 'B. Stratégie et plan marketing',                 label: "Le besoin est clairement démontré et la part du marché de l'entreprise est prouvée",                                                coefficient: 2 },
  { key: 'criterion5Score',  num: 5,  section: 'B. Stratégie et plan marketing',                 label: "L'intérêt de l'offre pour la clientèle et l'avantage concurrentiel sont prouvés",                                                                                           coefficient: 2 },
  { key: 'criterion6Score',  num: 6,  section: 'B. Stratégie et plan marketing',                 label: "L'étude FFOM des concurrents potentiels ainsi que le positionnement de l'entreprise sont cohérents et réalistes",                  coefficient: 2 },
  { key: 'criterion7Score',  num: 7,  section: 'B. Stratégie et plan marketing',                 label: 'Le plan marketing est cohérent et chiffré',                                                                                        coefficient: 3 },
  // C. Moyens techniques
  { key: 'criterion8Score',  num: 8,  section: 'C. Moyens techniques à mettre en œuvre',        label: "Les moyens humains du projet sont en adéquation avec son objet et les objectifs poursuivis",                                       coefficient: 2 },
  { key: 'criterion9Score',  num: 9,  section: 'C. Moyens techniques à mettre en œuvre',        label: "Les équipements nécessaires sont disponibles et acquérables, ainsi que la possibilité d'avoir des pièces de rechange",             coefficient: 2 },
  { key: 'criterion10Score', num: 10, section: 'C. Moyens techniques à mettre en œuvre',        label: 'Le processus de fabrication est maîtrisé',                                                                                         coefficient: 3 },
  // D. Impact environnemental et social
  { key: 'criterion11Score', num: 11, section: 'D. Impact environnemental et social',            label: "L'entreprise a intégré dans son approche la question de la protection de l'environnement (mesures d'atténuation) ou de résilience climatique", coefficient: 1.5 },
  { key: 'criterion12Score', num: 12, section: 'D. Impact environnemental et social',            label: "L'entreprise a intégré dans son approche la question d'inclusion sociale, la prise en compte des communautés locales et des personnes vulnérables", coefficient: 1.5 },
  { key: 'criterion16Score', num: 13, section: 'D. Impact environnemental et social',            label: "L'entreprise est-elle dirigée par une femme, un réfugié, un batwa, un albinos ou une personne vivant avec un autre handicap ?", coefficient: 1, binaryOnly: true },
  // E. Études économiques et financières
  { key: 'criterion13Score', num: 14, section: 'E. Études économiques et financières',           label: "Les chiffres utilisés dans la partie économique et financière et les autres parties du business plan sont cohérents",              coefficient: 2 },
  { key: 'criterion14Score', num: 15, section: 'E. Études économiques et financières',           label: 'La demande de financement est claire, chiffrée et cohérente',                                                                     coefficient: 2 },
  { key: 'criterion15Score', num: 16, section: 'E. Études économiques et financières',           label: "Les marges sont connues et l'activité est rentable",                                                                               coefficient: 2 },
];

export const SCORE_LABELS: Record<number, string> = {
  0: 'Nul',
  1: 'Très faible',
  2: 'Faible',
  3: 'Assez bien',
  4: 'Bien',
  5: 'Excellent',
};

export const TOTAL_MAX = SCORE_CRITERIA.reduce((sum, c) => sum + c.coefficient * 5, 0); // 160

export const RECOMMENDATION_OPTIONS: { value: RecommendationCode; label: string }[] = [
  { value: 'STRONGLY_RECOMMENDED',      label: 'Fortement recommandé' },
  { value: 'RECOMMENDED',               label: 'Recommandé' },
  { value: 'RECOMMENDED_WITH_RESERVES', label: 'Recommandé avec réserves' },
  { value: 'NOT_RECOMMENDED',           label: 'Non recommandé' },
];
