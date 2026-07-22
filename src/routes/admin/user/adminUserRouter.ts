import { Router } from "express";
import { validate } from "../../../middlewares/validate.ts";
import { adminUpdateUserSchema } from "../../../schemas/admin/user/updateUser.ts";
import adminUserController from "../../../controllers/admin/adminUserController.ts";

const router = Router();

router.get("/list", adminUserController.getUserList);
router.patch("/:id", validate(adminUpdateUserSchema), adminUserController.updateUser);
router.get("/:id", adminUserController.getUserById);
router.patch("/:id/delete", adminUserController.deleteUser);

export default router;
