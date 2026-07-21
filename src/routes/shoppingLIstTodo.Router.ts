import express from "express";
import { authenticate } from "../middlewares/auth.ts";
import { ShoppingListTodoController } from "../controllers/shoppingListTodo.Controller"; // 소문자 c 확인!

const router = express.Router();
const shoppingListTodoController = new ShoppingListTodoController();

// 1. 장보기 항목 추가 (Create)
router.post("/", authenticate, shoppingListTodoController.createItem);

// 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
router.get("/:refrigeratorId", authenticate, shoppingListTodoController.getItems);

// 3. 장보기 항목 수정 및 체크 상태 변경 (Update)
router.patch("/:itemId", authenticate, shoppingListTodoController.updateItem);

// 4. 장보기 항목 삭제 (Delete)
router.delete("/:itemId", authenticate, shoppingListTodoController.deleteItem);

export default router;
