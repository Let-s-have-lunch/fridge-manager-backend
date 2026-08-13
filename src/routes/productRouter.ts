import { Router } from "express";
import { validate } from "../middlewares/validate.ts";
import { productSchema } from "../schemas/prodict/productSchema.ts";
import productController from "../controllers/productController.ts";
import { upload } from "../middlewares/uploadMiddleware.ts";
import { authenticate } from "../middlewares/auth.ts";

const router = Router();
router.use(authenticate);

// 냉장고에 새 제품 등록 (URL에 create를 빼고 POST 메서드로 생성의 의미를 전달)
router.post("/fridge/:fridgeId", validate(productSchema), productController.createProduct);
router.get("/fridge/:fridgeId", productController.getProductList);
router.get("/:productId", productController.getProductById);
router.patch("/:productId", validate(productSchema), productController.updateProduct);
router.delete("/:productId", productController.deleteProduct);

export default router;
