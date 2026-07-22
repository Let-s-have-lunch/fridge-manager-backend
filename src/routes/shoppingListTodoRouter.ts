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
// 팀장님 주문 5번: get방식(조회) >> 주단위로 (펫 헬스 앱의 /list 대신 주 단위 범용 조회 사용)
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
