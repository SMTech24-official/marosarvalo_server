import z from "zod";

const createServiceSchema = z.object({
    disciplineId: z.string(),
    name: z.string(),
    duration: z.number(),
    price: z.number(),
});
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

const updateServiceSchema = z.object({
    disciplineId: z.string().optional(),
    name: z.string().optional(),
    duration: z.number().optional(),
    price: z.number().optional(),
});
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export default {
    createServiceSchema,
    updateServiceSchema,
};
