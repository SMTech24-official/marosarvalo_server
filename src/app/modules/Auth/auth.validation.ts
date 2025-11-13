import z from "zod";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});
export type LoginSchemaInput = z.infer<typeof loginSchema>;

const changePasswordSchema = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
});
export type ChangePasswordSchemaInput = z.infer<typeof changePasswordSchema>;

const forgotPasswordSchema = z.object({
    email: z.email(),
});
export type ForgotPasswordSchemaInput = z.infer<typeof forgotPasswordSchema>;

const refreshTokenSchema = z.object({
    refreshToken: z.string(),
});
export type RefreshTokenSchemaInput = z.infer<typeof refreshTokenSchema>;

export default {
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    refreshTokenSchema,
};
