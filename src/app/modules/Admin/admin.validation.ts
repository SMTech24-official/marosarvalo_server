import { z } from "zod";

const createAdminSchema = z.object({
    name: z.string().min(3),
    email: z.email(),
    phone: z.string().optional(),
    address: z.string().min(5),
    password: z.string().min(5),
});
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

const updateAdminSchema = z.object({});

export default {
    createAdminSchema,
};
