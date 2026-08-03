import { z } from "zod";
import { RoleType } from "../../../generated/prisma/enums.ts";

export const adminUpdateUserSchema = z.object({
    nickname: z.string().min(2).max(10),
    password: z.string().min(6).optional(),
    email: z.string().email(), // z.email()은 보통 z.string().email() 형태가 표준입니다
    birthdate: z.string().optional(),
    role: z.enum(RoleType),
}).partial();

export type AdminUpdateUserInputType = z.infer<typeof adminUpdateUserSchema>;