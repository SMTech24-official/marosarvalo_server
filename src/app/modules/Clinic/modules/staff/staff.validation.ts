import { Gender } from "@prisma/client";
import z from "zod";

const createStaffSchema = z.object({
    name: z.string(),
    employeeId: z.string(),
    email: z.email(),
    phone: z.string(),
    disciplineId: z.string(),
    role: z.string(),
    gender: z.enum(Gender),
    address: z.string(),
    password: z.string().optional(),
});
export type CreateStaffInput = z.infer<typeof createStaffSchema>;

const updateStaffSchema = z.object({
    name: z.string().optional(),
    employeeId: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    disciplineId: z.string().optional(),
    role: z.string().optional(),
    gender: z.enum(Gender).optional(),
    address: z.string().optional(),
    dateOfBirth: z.date().optional(),
});
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

const updateWorkingHoursSchema = z.object({
    saturday: z
        .object({
            from: z.object({ h: z.string(), m: z.string() }),
            to: z.object({ h: z.string(), m: z.string() }),
        })
        .optional(),
    sunday: z
        .object({
            from: z.object({ h: z.string(), m: z.string() }),
            to: z.object({ h: z.string(), m: z.string() }),
        })
        .optional(),
    monday: z
        .object({
            from: z.object({ h: z.string(), m: z.string() }),
            to: z.object({ h: z.string(), m: z.string() }),
        })
        .optional(),
    tuesday: z
        .object({
            from: z.object({ h: z.string(), m: z.string() }),
            to: z.object({ h: z.string(), m: z.string() }),
        })
        .optional(),
    wednesday: z
        .object({
            from: z.object({ h: z.string(), m: z.string() }),
            to: z.object({ h: z.string(), m: z.string() }),
        })
        .optional(),
    thursday: z
        .object({
            from: z.object({ h: z.string(), m: z.string() }),
            to: z.object({ h: z.string(), m: z.string() }),
        })
        .optional(),
    friday: z
        .object({
            from: z.object({ h: z.string(), m: z.string() }),
            to: z.object({ h: z.string(), m: z.string() }),
        })
        .optional(),
});
export type UpdateWorkingHourInput = z.infer<typeof updateWorkingHoursSchema>;

const insertHolidayInput = z.object({
    date: z.date(),
    reason: z.string(),
});
export type InsertHolidayInput = z.infer<typeof insertHolidayInput>;

export default {
    createStaffSchema,
    updateStaffSchema,
    updateWorkingHoursSchema,
    insertHolidayInput,
};
