import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
// 💡 클래스가 아니라 예전처럼 객체로 묶인 컨트롤러를 불러옵니다.
import shoppingListTodoController from "../controllers/shoppingListTodo.Controller.ts";

const router = Router();

// 1. 장보기 항목 추가 (Create)
router.post("/", authenticate, shoppingListTodoController.createItem);

// 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
router.get("/:refrigeratorId", authenticate, shoppingListTodoController.getItems);

// 3. 장보기 항목 수정 및 체크 상태 변경 (Update)
router.patch("/:itemId", authenticate, shoppingListTodoController.updateItem);

// 4. 장보기 항목 삭제 (Delete)
router.delete("/:itemId", authenticate, shoppingListTodoController.deleteItem);

export default router;