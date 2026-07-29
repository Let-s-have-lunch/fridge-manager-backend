import {z} from "zod";

export const createUserSchema = z.object({
    nickname: z.string().min(2).max(10),
    password: z.string().min(6),
    email: z.email(),
    birthdate: z.string().optional(),
});

export type CreateUserInputType = z.infer<typeof createUserSchema>;
