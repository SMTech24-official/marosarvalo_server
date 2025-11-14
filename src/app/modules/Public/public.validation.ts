import { z } from "zod";

const createPublicSchema = z.object({});
export type CreatePublicInput = z.infer<typeof createPublicSchema>;

const updatePublicSchema = z.object({});
export type UpdatePublicInput = z.infer<typeof updatePublicSchema>;

export default {
    createPublicSchema,
    updatePublicSchema,
};
