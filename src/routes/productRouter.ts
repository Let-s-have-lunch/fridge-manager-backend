import { Router } from "express";
import { validate } from "../middlewares/validate.ts";
import { productSchema } from "../schemas/productSchema.ts";
import productController from "../controllers/productController.ts";

const router = Router();

// 냉장고 안의 제품 목록 조회
router.get("/fridge/:fridgeId", productController.getProductList);

// 냉장고 안의 제품 통계 조회
router.get("/fridge/:fridgeId/statistics", productController.getFridgeStatistics);

// 냉장고에 새 제품 등록 (URL에 create를 빼고 POST 메서드로 생성의 의미를 전달합니다)
router.post(
    "/fridge/:fridgeId",
    validate(productSchema),
    productController.createProduct,
);

// 제품 상세 조회
router.get("/:productId", productController.getProductById);

// 제품 정보 수정 (상태 변경 포함)
router.patch("/:productId", validate(productSchema), productController.updateProduct);

// 제품 삭제
router.delete("/:productId", productController.deleteProduct);

export default router;
