import z from "zod";

const updateUserInfoSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    introduction: z.string().optional(),
    employeeId: z.string().optional(),
    profession: z.string().optional(),
});
export type UpdatesUserInfoInput = z.infer<typeof updateUserInfoSchema>;

export default {
    updateUserInfoSchema,
};
