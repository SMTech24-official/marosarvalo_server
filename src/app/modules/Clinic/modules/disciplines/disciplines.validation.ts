import z from "zod";

const createDisciplineSchema = z.object({
    name: z.string(),
});
export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;

const updateDisciplineSchema = z.object({
    name: z.string(),
});
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;

export default {
    createDisciplineSchema,
    updateDisciplineSchema,
};
