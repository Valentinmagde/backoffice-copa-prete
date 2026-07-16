import { z } from 'zod';

export const publicDocumentSchema = z.object({
  titleFr: z.string().optional(),
  titleRn: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionRn: z.string().optional(),
  categoryFr: z.string().optional(),
  categoryRn: z.string().optional(),
  isActive: z.boolean(),
  displayOrder: z.coerce.number().int().optional(),
});

export type PublicDocumentFormTypes = z.infer<typeof publicDocumentSchema>;

export const defaultPublicDocumentValues: PublicDocumentFormTypes = {
  titleFr: '',
  titleRn: '',
  descriptionFr: '',
  descriptionRn: '',
  categoryFr: '',
  categoryRn: '',
  isActive: true,
  displayOrder: 0,
};
