export interface PublicDocument {
  id: number;
  titleFr?: string;
  titleRn?: string;
  descriptionFr?: string;
  descriptionRn?: string;
  categoryFr?: string;
  categoryRn?: string;
  fileKeyFr?: string;
  originalFilenameFr?: string;
  fileSizeBytesFr?: number;
  mimeTypeFr?: string;
  fileKeyRn?: string;
  originalFilenameRn?: string;
  fileSizeBytesRn?: number;
  mimeTypeRn?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicDocumentDto {
  titleFr?: string;
  titleRn?: string;
  descriptionFr?: string;
  descriptionRn?: string;
  categoryFr?: string;
  categoryRn?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdatePublicDocumentDto = Partial<CreatePublicDocumentDto>;

export interface PublicDocumentFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface PublicDocumentsPage {
  data: PublicDocument[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
