import { z } from "zod";

export const noticeSchema = z.object({
    title: z.string().min(1, "제목은 필수값입니다."),
    content: z.string().min(1, "내용은 필수값입니다."),
});

export type NoticeInputType = z.infer<typeof noticeSchema>;
