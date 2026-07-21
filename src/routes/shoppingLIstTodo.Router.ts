import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts"; // 검증 미들웨어
import { shoppingListSchema } from "../schemas/shoppingList/shoppingListSchema.ts"; // 방금 만든 스키마
import shoppingListTodoController from "../controllers/shoppingListTodo.Controller.ts";

const router = Router();

// 1. 장보기 항목 추가 (검증 미들웨어 장착)
router.post("/", authenticate, validate(shoppingListSchema), shoppingListTodoController.createItem);

// 2. 특정 냉장고의 장보기 목록 전체 조회
router.get("/:refrigeratorId", authenticate, shoppingListTodoController.getItems);

// 3. 장보기 항목 수정 (검증 미들웨어 장착)
router.patch(
    "/:itemId",
    authenticate,
    validate(shoppingListSchema),
    shoppingListTodoController.updateItem,
);

// 4. 장보기 항목 삭제
router.delete("/:itemId", authenticate, shoppingListTodoController.deleteItem);

export default router;
