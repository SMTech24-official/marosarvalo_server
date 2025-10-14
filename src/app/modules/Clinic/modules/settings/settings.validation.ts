import z from "zod";

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

export default {
    updateClinicInfoSchema,
    updateBrandingInfoSchema,
};
