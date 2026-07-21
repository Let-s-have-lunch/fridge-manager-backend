import { Router } from "express";
import { validate } from "../middlewares/validate.ts";
import { categorySchema } from "../schemas/categorySchema.ts";
import categoryController from "../controllers/categoryController.ts";

const router = Router();

router.get("/", categoryController.getCategoryList);
router.post("/", validate(categorySchema), categoryController.createCategory);
router.patch("/:categoryId", validate(categorySchema), categoryController.updateCategory);
router.delete("/:categoryId", categoryController.deleteCategory);

export default router;
