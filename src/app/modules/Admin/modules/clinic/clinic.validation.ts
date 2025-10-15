import z from "zod";

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

const updateClinicSchema = z.object({
    clinic: z
        .object({
            name: z.string().min(3).optional(),
            email: z.email().optional(),
            phone: z.string().optional(),
            address: z.string().min(5).optional(),
        })
        .optional(),
    user: z
        .object({
            name: z.string().min(3).optional(),
            email: z.email().optional(),
            phone: z.string().optional(),
            address: z.string().min(5).optional(),
            password: z.string().optional(),
        })
        .optional(),
});
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;

export default {
    createClinicSchema,
    updateClinicSchema,
};
