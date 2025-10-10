import { CommunicationMethod, Gender, ProductType } from "@prisma/client";
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

const createReceiptSchema = z.object({
    patientId: z.string(),

    products: z.array(
        z.object({
            type: z.enum(ProductType),
            id: z.string(),
            quantity: z.number(),
        })
    ),

    tax: z.number(),
    discount: z.number(),
    paymentMethod: z.string(),
    paid: z.number(),
    subTotal: z.number(),
    total: z.number(),
    note: z.string().optional(),
});
export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;

export default {
    createClinicSchema,
    updateClinicSchema,
    createAppointmentSchema,
    createPatientSchema,
    createReceiptSchema,
};
