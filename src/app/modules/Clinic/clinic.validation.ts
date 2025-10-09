import { z } from "zod";

const createClinicSchema = z.object({});
export type CreateClinicInput = z.infer<typeof createClinicSchema>;

const updateClinicSchema = z.object({});
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;

const createAppointmentSchema = z.object({
    patientId: z.string(),
    disciplineId: z.string(),
    serviceId: z.string(),
    specialistId: z.string(),
    status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED"]),
    date: z.iso.date(),
    timeSlot: z.string(),
    note: z.string().optional(),
});
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export default {
    createClinicSchema,
    updateClinicSchema,
};
