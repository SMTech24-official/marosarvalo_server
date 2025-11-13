
import { z } from "zod";

const createPaymentsSchema = z.object({
	
});
export type CreatePaymentsInput = z.infer<typeof createPaymentsSchema>

const updatePaymentsSchema = z.object({
	
});
export type UpdatePaymentsInput = z.infer<typeof updatePaymentsSchema>


export default {
	createPaymentsSchema,
    updatePaymentsSchema,
};

