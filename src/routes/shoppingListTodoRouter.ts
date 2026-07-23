import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { shoppingListTodoSchema } from "../schemas/shoppingList/shoppingListTodoSchema.ts";
import { validate } from "../middlewares/validate.ts";
import shoppingListTodoController from "../controllers/shoppingListTodoController.ts";

const router = Router();

router.post(
    "/create",
    authenticate,
    validate(shoppingListTodoSchema),
    shoppingListTodoController.createItem,
);

// 🌟 팀장님 주문 반영: get방식(조회) >> 달력에서 선택한 "날짜 하루(date)" 기준으로 조회
router.get("/", authenticate, shoppingListTodoController.getItems);
router.patch(
    "/:id",
    authenticate,
    validate(shoppingListTodoSchema),
    shoppingListTodoController.updateItem,
);
router.delete("/:id", authenticate, shoppingListTodoController.deleteItem);
router.patch("/:id/toggle", authenticate, shoppingListTodoController.toggleTodo);

export default router;
