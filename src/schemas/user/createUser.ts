import {z} from "zod";

export const createUserSchema = z.object({
    nickname: z.string().min(2).max(10),
    password: z.string().min(6),
    email: z.email(),
    birthdate: z
        .string()
        .regex(/^\d{8}$/)
        .transform(
            value => new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`),
        ),
});

export type CreateUserInputType = z.infer<typeof createUserSchema>;
