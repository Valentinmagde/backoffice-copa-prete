import { apiClient } from '../client/base-client';
import type {
  PublicDocument,
  CreatePublicDocumentDto,
  UpdatePublicDocumentDto,
  PublicDocumentFilters,
  PublicDocumentsPage,
} from '../types/public-documents.types';

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

function toFormData(
  data: CreatePublicDocumentDto | UpdatePublicDocumentDto,
  fileFr?: File,
  fileRn?: File,
): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  if (fileFr) formData.append('fileFr', fileFr);
  if (fileRn) formData.append('fileRn', fileRn);
  return formData;
}

class PublicDocumentsApi {
  private readonly base = '/resources/public-documents';

  /**
   * Liste paginée des documents (admin, inclut inactifs)
   * GET /resources/public-documents/admin
   */
  async getPublicDocuments(
    filters?: PublicDocumentFilters,
  ): Promise<PublicDocumentsPage> {
    const qs = toQueryString(filters || {});
    return apiClient.get(`${this.base}/admin${qs}`);
  }

  /**
   * Récupère un document par son ID (admin)
   * GET /resources/public-documents/admin/:id
   */
  async getPublicDocumentById(id: number): Promise<PublicDocument> {
    return apiClient.get(`${this.base}/admin/${id}`);
  }

  /**
   * Crée un nouveau document (texte + fichiers fr/rn)
   * POST /resources/public-documents
   */
  async createPublicDocument(
    data: CreatePublicDocumentDto,
    fileFr?: File,
    fileRn?: File,
  ): Promise<PublicDocument> {
    return apiClient.post(this.base, toFormData(data, fileFr, fileRn));
  }

  /**
   * Met à jour un document (texte et/ou remplacement de fichiers)
   * PUT /resources/public-documents/:id
   */
  async updatePublicDocument(
    id: number,
    data: UpdatePublicDocumentDto,
    fileFr?: File,
    fileRn?: File,
  ): Promise<PublicDocument> {
    return apiClient.put(`${this.base}/${id}`, toFormData(data, fileFr, fileRn));
  }

  /**
   * Retire une seule variante de langue (fr ou rn) d'un document
   * DELETE /resources/public-documents/:id/file/:lang
   */
  async removePublicDocumentFile(
    id: number,
    lang: 'fr' | 'rn',
  ): Promise<PublicDocument> {
    return apiClient.delete(`${this.base}/${id}/file/${lang}`);
  }

  /**
   * Supprime un document
   * DELETE /resources/public-documents/:id
   */
  async deletePublicDocument(id: number): Promise<{ message: string }> {
    return apiClient.delete(`${this.base}/${id}`);
  }
}

export const publicDocumentsApi = new PublicDocumentsApi();
