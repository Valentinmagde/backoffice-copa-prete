import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluateurApi } from '../endpoints/evaluateur.api';
import type { EvaluationInput } from '../types/evaluateur.types';
import toast from 'react-hot-toast';

const keys = {
  evaluators: () => ['evaluators'] as const,
  myEvaluations: () => ['my-evaluations'] as const,
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

export function useEvaluationStats() {
  return useQuery({ queryKey: keys.stats(), queryFn: () => evaluateurApi.getStats() });
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
      toast.success('Évaluation soumise avec succès');
    },
    onError: () => toast.error("Erreur lors de la soumission de l'évaluation"),
  });
}
