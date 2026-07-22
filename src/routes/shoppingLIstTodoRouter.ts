import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
// 💡 여기서 두 스키마를 정확히 임포트해야 에디터에서 불이 들어옵니다!
import {
    shoppingListSchema,
    shoppingListUpdateSchema,
} from "../schemas/shoppingList/shoppingListTodoSchema.ts";
import shoppingListTodoController from "../controllers/shoppingListTodoController.ts";

const router = Router();

// 생성 시 사용
router.post("/", authenticate, validate(shoppingListSchema), shoppingListTodoController.createItem);

router.get("/:refrigeratorId", authenticate, shoppingListTodoController.getItems);

// 수정 시 사용
router.patch(
    "/:itemId",
    authenticate,
    validate(shoppingListUpdateSchema),
    shoppingListTodoController.updateItem,
);

router.delete("/:itemId", authenticate, shoppingListTodoController.deleteItem);

export default router;
