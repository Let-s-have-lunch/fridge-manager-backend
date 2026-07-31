import { z } from "zod";

export const inquiryAnswerSchema = z.object({
    answer: z.string().min(1, "답변은 필수 입력 사항입니다."),
});

export type InquiryAnswerInputType = z.infer<typeof inquiryAnswerSchema>;
