import z from "zod";

const createAppointmentSchema = z.object({
    patientId: z.string(),
    disciplineId: z.string(),
    serviceId: z.string(),
    specialistId: z.string(),
    status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED"]),
    date: z.iso.datetime(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    note: z.string().optional(),
});
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export default {
    createAppointmentSchema,
};
