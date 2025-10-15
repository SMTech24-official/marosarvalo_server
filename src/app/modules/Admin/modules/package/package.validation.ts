import {
    PackageDuration,
    PackageType,
    PlanType,
    UsageType,
} from "@prisma/client";
import z from "zod";

const createPackageSchema = z.object({
    packageType: z.enum(PackageType),
    usageType: z.enum(UsageType),
    planType: z.enum(PlanType),
    duration: z.enum(PackageDuration),
    features: z.array(z.string()).min(3),
    priceId: z.string(),
    price: z.number(),
});
export type CreatePackageInput = z.infer<typeof createPackageSchema>;

const updatePackageSchema = z.object({
    packageType: z.enum(PackageType).optional(),
    usageType: z.enum(UsageType).optional(),
    planType: z.enum(PlanType).optional(),
    duration: z.enum(PackageDuration).optional(),
    features: z.array(z.string()).min(3).optional(),
    priceId: z.string().optional(),
    price: z.number().optional(),
});
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

export default {
    createPackageSchema,
    updatePackageSchema,
};
