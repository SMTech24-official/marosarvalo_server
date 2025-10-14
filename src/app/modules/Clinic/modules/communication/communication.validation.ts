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

export default {
    createReminderScheduleSchema,
};
