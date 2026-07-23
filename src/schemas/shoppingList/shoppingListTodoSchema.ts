import { z } from "zod";

// 💡 생성과 수정 모두에서 공통으로 사용할 단 하나의 통합 스키마
export const shoppingListTodoSchema = z.object({
    // 1. 메모 (필수)
    memo: z.string().min(1, "메모 내용을 입력해주세요."),

    // 2. 날짜 (필수) - 문자열로 들어와도 Date 객체로 자동 변환
    date: z.coerce.date(),
});

// 컨트롤러에서 타입으로 사용할 수 있게 내보내기
export type ShoppingListInputType = z.infer<typeof shoppingListTodoSchema>;
