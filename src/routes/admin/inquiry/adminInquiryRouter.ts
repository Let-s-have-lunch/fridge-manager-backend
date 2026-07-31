import { Router } from "express";
import { validate } from "../../../middlewares/validate.ts";
import { inquiryAnswerSchema } from "../../../schemas/inquiry/inquiryAnswerSchema.ts";
import adminInquiryController from "../../../controllers/admin/adminInquiryController.ts";

const router = Router();

router.get("/list", adminInquiryController.getInquiryList);
router.get("/:inquiryId", adminInquiryController.getInquiryById);
router.patch("/:inquiryId", validate(inquiryAnswerSchema), adminInquiryController.answerInquiry);
router.delete("/:inquiryId", adminInquiryController.deleteInquiry);

export default router;
