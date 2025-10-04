import { z } from "zod";

const createAdminSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  phone: z.string().optional(),
  address: z.string().min(5),
  password: z.string().min(5),
});
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

const createClinicSchema = z.object({
  clinic: z.object({
    name: z.string().min(3),
    email: z.email(),
    phone: z.string(),
    address: z.string().min(5),
  }),
  user: z.object({
    name: z.string().min(3),
    email: z.email(),
    phone: z.string().optional(),
    address: z.string().min(5),
    password: z.string().min(5),
  }),
});
export type CreateClinicInput = z.infer<typeof createClinicSchema>;

const updateAdminSchema = z.object({});

export default {
  createAdminSchema,
  createClinicSchema,
};
