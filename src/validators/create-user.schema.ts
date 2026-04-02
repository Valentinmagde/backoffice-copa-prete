import { z } from 'zod';
import { messages } from '@/config/messages';
import { validateEmail } from './common-rules';

// form zod validation schema
export const createUserSchema = z.object({
  firstName: z.string().min(1, { message: messages.firstNameIsRequired }),
  lastName: z.string().min(1, { message: messages.lastNameIsRequired }),
  email: validateEmail,
  password: z.string()
    .min(8, { message: messages.passwordRequired })
    .regex(/[A-Z]/, { message: messages.passwordOneUppercase })
    .regex(/[0-9]/, { message: messages.passwordOneNumeric })
    .regex(/[a-z]/, { message: messages.passwordOneLowercase }),
  phoneNumber: z.string().optional(),
  roleCode: z.string().min(1, { message: messages.roleIsRequired }),
  // permissions: z.string().min(1, { message: messages.permissionIsRequired }),
  status: z.string().min(1, { message: messages.statusIsRequired }),
});

// generate form types from zod validation schema
export type CreateUserInput = z.infer<typeof createUserSchema>;
