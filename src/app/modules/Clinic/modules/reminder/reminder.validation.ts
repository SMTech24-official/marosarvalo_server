import { CommunicationMethod, ReminderScheduleType } from "@prisma/client";
import z from "zod";

const createReminderScheduleSchema = z.object({
    type: z.enum(ReminderScheduleType),
    prior: z.number().optional(),
    description: z.string().optional(),
    communicationMethods: z.array(z.enum(CommunicationMethod)),
    subject: z.string(),
    body: z.string(),
});
export type CreateReminderScheduleInput = z.infer<
    typeof createReminderScheduleSchema
>;

const updateReminderScheduleSchema = z.object({
    type: z.enum(ReminderScheduleType).optional(),
    prior: z.number().optional(),
    description: z.string().optional(),
    communicationMethods: z.array(z.enum(CommunicationMethod)).optional(),
    subject: z.string().optional(),
    body: z.string().optional(),
});
export type UpdateReminderScheduleInput = z.infer<
    typeof updateReminderScheduleSchema
>;

export default {
    createReminderScheduleSchema,
    updateReminderScheduleSchema,
};
