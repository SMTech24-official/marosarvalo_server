import { Gender, StaffRoles } from "@prisma/client";
import z from "zod";

const createStaffSchema = z.object({
    name: z.string(),
    employeeId: z.string(),
    email: z.email(),
    phone: z.string(),
    disciplineId: z.string(),
    role: z.enum({ ...StaffRoles, ADMIN: "ADMIN" }),
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
    role: z.enum(StaffRoles).optional(),
    gender: z.enum(Gender).optional(),
    address: z.string().optional(),
    dateOfBirth: z.date().optional(),
});
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

const updateWorkingHoursSchema = z.object({
    saturday: z
        .object({
            from: z.iso.datetime(),
            to: z.iso.datetime(),
        })
        .optional(),
    sunday: z
        .object({
            from: z.iso.datetime(),
            to: z.iso.datetime(),
        })
        .optional(),
    monday: z
        .object({
            from: z.iso.datetime(),
            to: z.iso.datetime(),
        })
        .optional(),
    tuesday: z
        .object({
            from: z.iso.datetime(),
            to: z.iso.datetime(),
        })
        .optional(),
    wednesday: z
        .object({
            from: z.iso.datetime(),
            to: z.iso.datetime(),
        })
        .optional(),
    thursday: z
        .object({
            from: z.iso.datetime(),
            to: z.iso.datetime(),
        })
        .optional(),
    friday: z
        .object({
            from: z.iso.datetime(),
            to: z.iso.datetime(),
        })
        .optional(),
});
export type UpdateWorkingHourInput = z.infer<typeof updateWorkingHoursSchema>;

const insertHolidayInput = z.object({
    date: z.iso.datetime(),
    reason: z.string(),
});
export type InsertHolidayInput = z.infer<typeof insertHolidayInput>;

const updateHolidayInput = z.object({
    date: z.iso.datetime().optional(),
    reason: z.string().optional(),
});
export type UpdateHolidayInput = z.infer<typeof updateHolidayInput>;

export default {
    createStaffSchema,
    updateStaffSchema,
    updateWorkingHoursSchema,
    insertHolidayInput,
    updateHolidayInput,
};
