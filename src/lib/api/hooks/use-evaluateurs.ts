import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { evaluateurApi } from '../endpoints/evaluateur.api';
import type { EvaluationInput, Evaluation } from '../types/evaluateur.types';
import toast from 'react-hot-toast';


const keys = {
  evaluators: () => ['evaluators'] as const,
  myEvaluations: () => ['my-evaluations'] as const,
  allEvaluations: (editionId?: number) => ['evaluations', 'all', editionId] as const,
  assignments: () => ['evaluation-assignments'] as const,
  assignmentsByBusinessPlan: (id: number) => ['evaluation-assignments', 'bp', id] as const,
  evaluationsByBusinessPlan: (id: number) => ['evaluations', 'bp', id] as const,
  stats: () => ['evaluations', 'stats'] as const,
};

export function useEvaluators() {
  return useQuery({ queryKey: keys.evaluators(), queryFn: () => evaluateurApi.getAllEvaluators() });
}

export function useMyEvaluations() {
  return useQuery({
    queryKey: keys.myEvaluations(),
    queryFn: () => evaluateurApi.getMyEvaluations(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useAllEvaluations(editionId?: number) {
  return useQuery({
    queryKey: keys.allEvaluations(editionId),
    queryFn: () => evaluateurApi.getAllEvaluations(editionId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useEvaluationAssignments(editionId?: number) {
  return useQuery({
    queryKey: keys.assignments(),
    queryFn: () => evaluateurApi.getAllAssignments(editionId),
  });
}

export function useAssignmentsByBusinessPlan(businessPlanId: number | null | undefined) {
  return useQuery({
    queryKey: keys.assignmentsByBusinessPlan(businessPlanId!),
    queryFn: () => evaluateurApi.getAssignmentsByBusinessPlan(businessPlanId!),
    enabled: !!businessPlanId,
  });
}

export function useEvaluationsByBusinessPlan(businessPlanId: number | null | undefined) {
  return useQuery({
    queryKey: keys.evaluationsByBusinessPlan(businessPlanId!),
    queryFn: () => evaluateurApi.getEvaluationsByBusinessPlan(businessPlanId!),
    enabled: !!businessPlanId,
  });
}

export function useEvaluationGaps(businessPlanId: number | null | undefined) {
  return useQuery({
    queryKey: ['evaluation-gaps', businessPlanId] as const,
    queryFn: () => evaluateurApi.getEvaluationGaps(businessPlanId!),
    enabled: !!businessPlanId,
  });
}

export function useEvaluationStats() {
  return useQuery({ queryKey: keys.stats(), queryFn: () => evaluateurApi.getStats() });
}

export function useEvaluationsForPlans(planIds: number[]): Record<number, Evaluation[]> {
  const results = useQueries({
    queries: planIds.map((id) => ({
      queryKey: keys.evaluationsByBusinessPlan(id),
      queryFn: () => evaluateurApi.getEvaluationsByBusinessPlan(id),
    })),
  });
  return Object.fromEntries(planIds.map((id, i) => [id, results[i]?.data ?? []]));
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { businessPlanId: number; evaluatorId: number; copaEditionId: number; deadline?: string }) =>
      evaluateurApi.createAssignment(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.assignments() });
      qc.invalidateQueries({ queryKey: keys.assignmentsByBusinessPlan(vars.businessPlanId) });
      toast.success('Évaluateur affecté avec succès');
    },
    onError: () => toast.error("Erreur lors de l'affectation"),
  });
}

export function useSubmitEvaluation(businessPlanId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EvaluationInput) => evaluateurApi.submitEvaluation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.evaluationsByBusinessPlan(businessPlanId) });
      qc.invalidateQueries({ queryKey: keys.assignmentsByBusinessPlan(businessPlanId) });
      qc.invalidateQueries({ queryKey: keys.myEvaluations() });
      toast.success('Évaluation soumise avec succès');
    },
    onError: () => toast.error("Erreur lors de la soumission de l'évaluation"),
  });
}

export function useUpdateEvaluation(evaluationId: number, businessPlanId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EvaluationInput>) => evaluateurApi.updateEvaluation(evaluationId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.evaluationsByBusinessPlan(businessPlanId) });
      qc.invalidateQueries({ queryKey: keys.myEvaluations() });
      toast.success('Évaluation mise à jour avec succès');
    },
    onError: () => toast.error("Erreur lors de la mise à jour de l'évaluation"),
  });
}
