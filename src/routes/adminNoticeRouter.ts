import { Router } from "express";
import { validate } from "../middlewares/validate";
import { noticeSchema } from "../schemas/admin/notice/noticeSchema.ts";
import adminNoticeController from "../controllers/admin/adminNoticeController.ts";
const router = Router();

router.post("/", validate(noticeSchema), adminNoticeController.createNotice);
router.patch("/:noticeId", validate(noticeSchema), adminNoticeController.updateNotice);
router.delete("/:noticeId", adminNoticeController.deleteNotice);

export default router;
