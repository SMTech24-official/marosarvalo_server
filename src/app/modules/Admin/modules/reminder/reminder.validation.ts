import { z } from "zod";

const createReminderSchema = z.object({});
export type CreateReminderInput = z.infer<typeof createReminderSchema>;

const updateReminderSchema = z.object({});
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

const sendReminderSchema = z.object({
    email: z.string(),
    subject: z.string(),
    message: z.string(),
});
export type SendReminderInput = z.infer<typeof sendReminderSchema>;

export default {
    createReminderSchema,
    updateReminderSchema,
    sendReminderSchema,
};
