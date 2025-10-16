import { z } from "zod";

const createSpecialistSchema = z.object({});
export type CreateSpecialistInput = z.infer<typeof createSpecialistSchema>;

const updateSpecialistSchema = z.object({});
export type UpdateSpecialistInput = z.infer<typeof updateSpecialistSchema>;

export default {
    createSpecialistSchema,
    updateSpecialistSchema,
};
