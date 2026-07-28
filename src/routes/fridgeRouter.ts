import { Router } from "express";
import fridgeController from "../controllers/fridgeController.ts";
import { validate } from "../middlewares/validate.ts";
import { fridgeSchema } from "../schemas/fridgeSchema.ts";
import { authenticate } from "../middlewares/auth.ts";

const router = Router();

router.use(authenticate)

router.get("/", fridgeController.getFridgeList);
router.post("/create", validate(fridgeSchema), fridgeController.createFridge);
router.patch("/:id", validate(fridgeSchema), fridgeController.updateFridge);
router.delete("/:id", fridgeController.deleteFridge);

export default router;