import { z } from "zod";

export const shoppingListSchema = z.object({
    refrigeratorId: z
        .number()
        .int("냉장고 ID는 정수여야 합니다.")
        .positive("유효하지 않은 냉장고 ID입니다."),

    productName: z.string().min(1, "상품명은 필수 입력 항목입니다."),

    quantity: z
        .number()
        .int("수량은 정수여야 합니다.")
        .min(1, "수량은 최소 1개 이상이어야 합니다.")
        .optional(),

    isChecked: z.boolean().optional(),
});

export const shoppingListUpdateSchema = shoppingListSchema.partial();

// 💡 여기서 선언하고 export 해야 다른 파일에서 쓸 수 있습니다!
export type ShoppingListInputType = z.infer<typeof shoppingListSchema>;
export type ShoppingListUpdateInputType = z.infer<typeof shoppingListUpdateSchema>;
