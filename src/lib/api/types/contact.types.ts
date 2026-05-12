export type ContactStatus = 'PENDING' | 'READ' | 'RESPONDED' | 'CLOSED';

export interface Contact {
  id: number;
  isAnonymous: boolean;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface ContactFilters {
  search?: string;
  status?: ContactStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedContacts {
  data: Contact[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
