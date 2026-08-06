import { Router } from "express";
import { validate } from "../../../middlewares/validate.ts";
import { noticeSchema } from "../../../schemas/admin/notice/noticeSchema.ts";
import adminNoticeController from "../../../controllers/admin/adminNoticeController.ts";
const router = Router();

router.get("/", adminNoticeController.getNoticeList); // 컨트롤러 함수명에 맞게 조정
router.get("/:noticeId", adminNoticeController.getNoticeById); // 상세 조회용
router.post("/", validate(noticeSchema), adminNoticeController.createNotice);
router.patch("/:noticeId", validate(noticeSchema), adminNoticeController.updateNotice);
router.delete("/:noticeId", adminNoticeController.deleteNotice);

export default router;
