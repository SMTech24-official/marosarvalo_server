
import { z } from "zod";

const createBookingsSchema = z.object({
	
});
export type CreateBookingsInput = z.infer<typeof createBookingsSchema>

const updateBookingsSchema = z.object({
	
});
export type UpdateBookingsInput = z.infer<typeof updateBookingsSchema>


export default {
	createBookingsSchema,
    updateBookingsSchema,
};

