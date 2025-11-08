import { z } from "zod";

const createCustomersSchema = z.object({});
export type CreateCustomersInput = z.infer<typeof createCustomersSchema>;

const updateCustomersSchema = z.object({});
export type UpdateCustomersInput = z.infer<typeof updateCustomersSchema>;

export default {
    createCustomersSchema,
    updateCustomersSchema,
};
