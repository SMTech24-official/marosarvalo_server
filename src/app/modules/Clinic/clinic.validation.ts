import {
    CommunicationMethod,
    Gender,
    ProductType,
    ReminderScheduleType,
} from "@prisma/client";
import { z } from "zod";

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

const updateClinicInfoSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
});
export type UpdateClinicInfoInput = z.infer<typeof updateClinicInfoSchema>;

const updateBrandingInfoSchema = z.object({
    title: z.string(),
    email: z.string(),
    note: z.string(),
});
export type UpdateBrandingInfoInput = z.infer<typeof updateBrandingInfoSchema>;

// Services
const createServiceSchema = z.object({
    disciplineId: z.string(),
    name: z.string(),
    duration: z.number(),
    price: z.number(),
});
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

const updateServiceSchema = z.object({
    disciplineId: z.string().optional(),
    name: z.string().optional(),
    duration: z.number().optional(),
    price: z.number().optional(),
});
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// Discipline

const createDisciplineSchema = z.object({
    name: z.string(),
});
export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;

const updateDisciplineSchema = z.object({
    name: z.string(),
});
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;

// Staff
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
});
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

export default {
    createAppointmentSchema,
    createPatientSchema,
    createReceiptSchema,
    createReminderScheduleSchema,
    updateClinicInfoSchema,
    updateBrandingInfoSchema,
    createServiceSchema,
    updateServiceSchema,
    createDisciplineSchema,
    updateDisciplineSchema,
    createStaffSchema,
    updateStaffSchema
};
