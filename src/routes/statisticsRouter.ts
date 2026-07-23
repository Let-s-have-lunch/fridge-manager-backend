import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import statisticsController from "../controllers/statisticsController.ts";

const router = Router();

// 유저별 제품 통계
router.get("/", authenticate, statisticsController.getUserStatistics);

export default router;