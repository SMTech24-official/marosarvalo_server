import { ProductType } from "@prisma/client";
import z from "zod";

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
    createReceiptSchema,
};
