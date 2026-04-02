import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateEmail } from './common-rules';

// form zod validation schema
export const personalInfoFormSchema = z.object({
  firstName: z.string().min(1, { message: messages.firstNameRequired }),
  lastName: z.string().optional(),
  email: validateEmail,
  // profilePhotoUrl: fileSchema.optional(),
  role: z.array(z.any()).optional(),
  phoneNumber:  z.string().optional(),
  // country: z.string().optional(),
  // timezone: z.string().optional(),
  bio: z.string().optional(),
  // portfolios: z.array(fileSchema).optional(),
});

// generate form types from zod validation schema
export type PersonalInfoFormTypes = z.infer<typeof personalInfoFormSchema>;

export const defaultValues = {
  first_name: '',
  last_name: undefined,
  email: '',
  avatar: undefined,
  role: undefined,
  country: undefined,
  timezone: undefined,
  bio: undefined,
  portfolios: undefined,
};
