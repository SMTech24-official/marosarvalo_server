import { z } from "zod";

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
        phone: z.string(),
        address: z.string().min(5),
    }),
    package: z.string(),
});
export type CreateClinicInput = z.infer<typeof createClinicSchema>;

const updateStripeSchema = z.object({});
export type UpdateStripeInput = z.infer<typeof updateStripeSchema>;

export default {
    createClinicSchema,
    updateStripeSchema,
};
