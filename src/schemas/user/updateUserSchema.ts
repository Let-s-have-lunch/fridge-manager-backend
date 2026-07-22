import { z } from "zod";

export const updateUserSchema = z.object({
    nickname: z
        .string()
        .min(2, "닉네임은 2글자 이상이어야 합니다.")
        .max(10, "닉네임은 10글자 이하여야 합니다."),
    birthdate: z.string().optional(),
});

export type UpdateUserInputType = z.infer<typeof updateUserSchema>;
