import { Router } from "express";
import fridgeController from "../controllers/fridgeController.ts";
import { validate } from "../middlewares/validate.ts";
import { fridgeSchema } from "../schemas/fridgeSchema.ts";

const router = Router();

router.get("/", fridgeController.getFridgeList);
router.post("/create", validate(fridgeSchema), fridgeController.createFridge);
router.patch("/:id", validate(fridgeSchema), fridgeController.updateFridge);
router.delete("/:id", fridgeController.deleteFridge);

export default router;