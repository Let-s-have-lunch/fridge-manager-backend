import { Router } from "express";
import { validate } from "../middlewares/validate.ts";
import { categorySchema } from "../schemas/categorySchema.ts";
import categoryController from "../controllers/categoryController.ts";
import { authenticate } from "../middlewares/auth.ts";

const router = Router();

router.get("/", authenticate, categoryController.getCategoryList);
router.post("/", authenticate, validate(categorySchema), categoryController.createCategory);
router.patch(
    "/:categoryId",
    authenticate,
    validate(categorySchema),
    categoryController.updateCategory,
);
router.delete("/:categoryId", authenticate, categoryController.deleteCategory);

export default router;
