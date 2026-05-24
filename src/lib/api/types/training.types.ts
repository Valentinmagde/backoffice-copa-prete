export interface Training {
  id: number;
  code: string;
  title: string;
  description: string | null;
  durationHours: number | null;
  format: string | null;
  isCopaMandatory: boolean;
  isActive: boolean;
  sessions: TrainingSession[];
  createdAt: string;
}

export interface TrainingSession {
  id: number;
  sessionCode: string;
  trainingId: number;
  training: Training;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  maxCapacity: number | null;
  currentEnrollment: number;
  physicalLocation: string | null;
  status: string;
  primaryTrainer?: { id: number; user: { firstName: string; lastName: string } };
  createdAt: string;
}

export interface TrainingParticipation {
  id: number;
  sessionId: number;
  beneficiaryId: number;
  beneficiary?: { id: number; user: { firstName: string; lastName: string; phone?: string } };
  attendanceStatus: string;
  attendanceDate: string | null;
  hasValidated: boolean;
  certificateObtained: boolean;
  certificateObtainedAt: string | null;
  createdAt: string;
}
