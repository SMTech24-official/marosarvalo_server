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

export default {
    createStaffSchema,
    updateStaffSchema,
};
