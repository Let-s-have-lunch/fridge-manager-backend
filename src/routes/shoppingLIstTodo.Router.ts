import express from "express";
import { authenticate } from "../middlewares/auth.ts"; // 인증 미들웨어 추가
// import { validate } from "../middlewares/validate.ts"; // 필요시 스키마 미들웨어 추가
import { ShoppingListTodoController } from "../controllers/shoppingListTodo.Controller";

const router = express.Router();
const shoppingListTodoController = new ShoppingListTodoController();

// 1. 장보기 항목 추가 (Create)
router.post(
    "/",
    authenticate,
    (req, res) => shoppingListTodoController.createItem(req, res), // 화살표 함수로 this 에러 방지
);

// 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
router.get("/:refrigeratorId", authenticate, (req, res) =>
    shoppingListTodoController.getItems(req, res),
);

// 3. 장보기 항목 수정 및 체크 상태 변경 (Update)
router.patch("/:itemId", authenticate, (req, res) =>
    shoppingListTodoController.updateItem(req, res),
);

// 4. 장보기 항목 삭제 (Delete)
router.delete("/:itemId", authenticate, (req, res) =>
    shoppingListTodoController.deleteItem(req, res),
);

export default router;
