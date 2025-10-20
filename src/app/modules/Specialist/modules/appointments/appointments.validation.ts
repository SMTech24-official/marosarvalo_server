
import { z } from "zod";

const createAppointmentsSchema = z.object({
	
});
export type CreateAppointmentsInput = z.infer<typeof createAppointmentsSchema>

const updateAppointmentsSchema = z.object({
	
});
export type UpdateAppointmentsInput = z.infer<typeof updateAppointmentsSchema>


export default {
	createAppointmentsSchema,
    updateAppointmentsSchema,
};

