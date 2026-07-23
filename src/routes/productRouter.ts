import { Router } from "express";
import { validate } from "../middlewares/validate.ts";
import { productSchema } from "../schemas/productSchema.ts";
import productController from "../controllers/productController.ts";
import {upload} from "../middlewares/uploadMiddleware.ts";
import { authenticate } from "../middlewares/auth.ts";

const router = Router();

// 냉장고 안의 제품 목록 조회
router.get("/fridge/:fridgeId", authenticate,productController.getProductList);



// 냉장고에 새 제품 등록 (URL에 create를 빼고 POST 메서드로 생성의 의미를 전달합니다)
router.post(
    "/fridge/:fridgeId",
    validate(productSchema),
    productController.createProduct,
);

// 제품 상세 조회
router.get("/:productId", authenticate, productController.getProductById);

// 제품 정보 수정 (상태 변경 포함)
router.patch("/:productId", authenticate, validate(productSchema), productController.updateProduct);

// 제품 삭제
router.delete("/:productId",authenticate, productController.deleteProduct);

// 영수증 스캔으로 제품 다중 등록
router.post(
    "/fridge/:fridgeId/receipt",
    authenticate,
    upload.single("receiptImage"),
    productController.createProductsByReceipt,
);

export default router;
