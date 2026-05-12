import { apiClient } from '../client/base-client';
import type { Contact, ContactFilters, PaginatedContacts } from '../types/contact.types';

class ContactApi {
  private readonly base = '/contacts';

  async getAll(filters: ContactFilters = {}): Promise<PaginatedContacts> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const url = `${this.base}${params.toString() ? `?${params}` : ''}`;
    return apiClient.get<PaginatedContacts>(url);
  }

  async getById(id: number): Promise<Contact> {
    return apiClient.get<Contact>(`${this.base}/${id}`);
  }

  async markAsRead(id: number): Promise<Contact> {
    return apiClient.patch<Contact>(`${this.base}/${id}/read`, {});
  }

  async respond(id: number, response: string): Promise<Contact> {
    return apiClient.post<Contact>(`${this.base}/${id}/respond`, { response });
  }

  async close(id: number): Promise<Contact> {
    return apiClient.patch<Contact>(`${this.base}/${id}/close`, {});
  }
}

export const contactApi = new ContactApi();
