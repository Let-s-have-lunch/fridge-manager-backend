import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("올바른 이메일 형식으로 입력해주세요."),
    password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export type LoginInputType = z.infer<typeof loginSchema>;
