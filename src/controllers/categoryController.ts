import { Request, Response } from "express";
import categoryService from "../services/categoryService.ts";
import { CategoryInputType } from "../schemas/categorySchema.ts";

const getCategoryList = async (req: Request, res: Response) => {
    try {
        const result = await categoryService.getCategoryList();
        res.status(200).json({ message: "카테고리 목록 조회 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const createCategory = async (req: Request, res: Response) => {
    try {
        const { name }: CategoryInputType = req.body;
        const result = await categoryService.createCategory(name);
        res.status(201).json({ message: "카테고리 생성 성공", data: result });
    } catch (error: any) {
        if (error.message === "DUPLICATED_CATEGORY") {
            res.status(409).json({ message: "이미 존재하는 카테고리입니다." });
            return;
        }
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const updateCategory = async (req: Request, res: Response) => {
    try {
        const categoryId = Number(req.params.categoryId);
        if (isNaN(categoryId)) {
            res.status(400).json({ message: "유효하지 않은 categoryId 입니다." });
            return;
        }

        const { name }: CategoryInputType = req.body;

        const result = await categoryService.updateCategory(categoryId, name);
        res.status(200).json({ message: "카테고리 수정 성공", data: result });
    } catch (error: any) {
        if (error.message === "CATEGORY_NOT_FOUND") {
            res.status(404).json({ message: "해당 카테고리를 찾을 수 없습니다." });
            return;
        }
        if (error.message === "DUPLICATED_CATEGORY") {
            res.status(409).json({ message: "이미 존재하는 카테고리 이름입니다." });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const categoryId = Number(req.params.categoryId);
        if (isNaN(categoryId)) {
            res.status(400).json({ message: "유효하지 않은 categoryId 입니다." });
            return;
        }

        await categoryService.deleteCategory(categoryId);
        res.status(200).json({ message: "카테고리 삭제 성공" });
    } catch (error: any) {
        if (error.message === "CATEGORY_NOT_FOUND") {
            res.status(404).json({ message: "해당 카테고리를 찾을 수 없습니다." });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

export default { getCategoryList, createCategory, updateCategory, deleteCategory };
