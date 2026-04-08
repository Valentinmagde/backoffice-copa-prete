export interface Cohort {
    id: number;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'inactive' | 'pending';
    maxParticipants?: number;
    participantCount: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

export interface CreateCohortDto {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status?: 'active' | 'inactive' | 'pending';
    maxParticipants?: number;
}

export interface UpdateCohortDto extends Partial<CreateCohortDto> {
    id?: number;
}

export interface CohortStats {
    totalCohorts: number;
    activeCohorts: number;
    inactiveCohorts: number;
    pendingCohorts: number;
    totalParticipants: number;
    averageParticipantsPerCohort: number;
}

export interface CohortFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}