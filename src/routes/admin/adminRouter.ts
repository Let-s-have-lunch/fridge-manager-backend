import { Router } from "express";
import { authenticate, requiredAdmin } from "../../middlewares/auth.ts";
import adminNoticeRouter from "../adminNoticeRouter.ts";
import adminUserRouter from "./user/adminUserRouter.ts";
import adminDashboardController from "../../controllers/admin/adminDashboardController.ts";

const router = Router();

router.use(authenticate);
router.use(requiredAdmin);


router.use("/notice", adminNoticeRouter);
router.use("/user", adminUserRouter);

router.get("/summary", adminDashboardController.getDashboardSummary);

export default router;
