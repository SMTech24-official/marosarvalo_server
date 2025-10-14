import { CommunicationMethod, Gender } from "@prisma/client";
import z from "zod";

const createPatientSchema = z.object({
    firstName: z.string(),
    lastName: z.string().optional(),

    address: z.string().optional(),
    documentId: z.string().optional(),
    dateOfBirth: z.string().optional(),

    gender: z.enum(Gender),
    phone: z.string(),
    email: z.email().optional(),

    guardianName: z.string().optional(),
    guardianRelation: z.string().optional(),

    contactPreferences: z.array(z.enum(CommunicationMethod)),
    note: z.string().optional(),

    medicalCondition: z.string().optional(),
    allergies: z.string().optional(),
    medications: z.string().optional(),
});
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

export default {
    createPatientSchema,
};
