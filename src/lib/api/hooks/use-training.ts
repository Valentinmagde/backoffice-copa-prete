import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingApi } from '../endpoints/training.api';
import toast from 'react-hot-toast';

const keys = {
  trainings: () => ['trainings'] as const,
  sessions: () => ['training-sessions'] as const,
  participants: (sessionId: number) => ['training-sessions', sessionId, 'participants'] as const,
};

export function useTrainings() {
  return useQuery({ queryKey: keys.trainings(), queryFn: () => trainingApi.getAllTrainings() });
}

export function useTrainingSessions(editionId?: number) {
  return useQuery({ queryKey: keys.sessions(), queryFn: () => trainingApi.getAllSessions(editionId) });
}

export function useSessionParticipants(sessionId: number) {
  return useQuery({
    queryKey: keys.participants(sessionId),
    queryFn: () => trainingApi.getSessionParticipants(sessionId),
    enabled: !!sessionId,
  });
}

export function useUpdateSessionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: string }) =>
      trainingApi.updateSessionStatus(sessionId, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.sessions() }); toast.success('Statut mis à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}

export function useIssueCertificate(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (beneficiaryId: number) => trainingApi.issueCertificate(sessionId, beneficiaryId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.participants(sessionId) }); toast.success('Certificat émis'); },
    onError: () => toast.error('Erreur lors de l\'émission du certificat'),
  });
}
