
import { z } from "zod";

const createReportsSchema = z.object({
	
});
export type CreateReportsInput = z.infer<typeof createReportsSchema>

const updateReportsSchema = z.object({
	
});
export type UpdateReportsInput = z.infer<typeof updateReportsSchema>


export default {
	createReportsSchema,
    updateReportsSchema,
};

