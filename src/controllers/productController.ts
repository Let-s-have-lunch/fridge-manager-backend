import { Request, Response } from "express";
import productService from "../services/productService.ts";
import { ProductInputType } from "../schemas/productSchema.ts";

const getProductList = async (req: Request, res: Response) => {
    try {
        const fridgeId = Number(req.params.fridgeId);
        if (isNaN(fridgeId)) {
            res.status(400).json({ message: "유효하지 않은 fridgeId 입니다."})
            return;
        }

        const sort = req.query.sort as string; // "expire" 또는 "category"
        const keyword = req.query.keyword as string; // 검색어 (옵션)

        const result = await productService.getProductList(fridgeId, sort, keyword);
        res.status(200).json({ message: "제품 목록 조회 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const getFridgeStatistics = async (req: Request, res: Response) => {
    try {
        const fridgeId = Number(req.params.fridgeId);
        if (isNaN(fridgeId)) {
            res.status(400).json({ message: "유효하지 않은 fridgeId 입니다." });
            return;
        }

        // 쿼리스트링에서 년/월 받기 (없으면 현재 날짜를 기준으로 이번 달 설정)
        const today = new Date();
        const year = Number(req.query.year) || today.getFullYear();
        const month = Number(req.query.month) || today.getMonth() + 1;

        const result = await productService.getFridgeStatistics(fridgeId, year, month);
        res.status(200).json({ message: "냉장고 통계 조회 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const getProductById = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            res.status(400).json({ message: "유효하지 않은 productId 입니다." });
            return;
        }

        const result = await productService.getProductById(productId);
        res.status(200).json({ message: "제품 상세 조회 성공", data: result });
    } catch (error: any) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            res.status(404).json({ message: "해당 제품을 찾을 수 없습니다." });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const createProduct = async (req: Request, res: Response) => {
    try {
        const fridgeId = Number(req.params.fridgeId);
        if (isNaN(fridgeId)) {
            res.status(400).json({ message: "유효하지 않은 fridgeId 입니다." });
            return;
        }

        const productData: ProductInputType = req.body;

        const result = await productService.createProduct(fridgeId, productData);
        res.status(201).json({ message: "제품 등록 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const updateProduct = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            res.status(400).json({ message: "유효하지 않은 productId 입니다." });
            return;
        }

        const productData: ProductInputType = req.body;

        const result = await productService.updateProduct(productId, productData);
        res.status(200).json({ message: "제품 수정 성공", data: result });
    } catch (error: any) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            res.status(404).json({ message: "해당 제품을 찾을 수 없습니다." });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const deleteProduct = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            res.status(400).json({ message: "유효하지 않은 productId 입니다." });
            return;
        }

        await productService.deleteProduct(productId);
        res.status(200).json({ message: "제품 삭제 성공" });
    } catch (error: any) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            res.status(404).json({ message: "해당 제품을 찾을 수 없습니다." });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

export default {
    getProductList,
    getFridgeStatistics,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
