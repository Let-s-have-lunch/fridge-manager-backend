import { Request, Response, NextFunction } from "express";
import shoppingListTodoService from "../services/shoppingListTodo.Service";

// 1. 장보기 항목 추가 (Create)
const createItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { refrigeratorId, productName, quantity } = req.body;

        if (!refrigeratorId || !productName) {
            return res.status(400).json({ errorMessage: "냉장고 ID와 상품명은 필수입니다." });
        }

        if (isNaN(Number(refrigeratorId))) {
            return res.status(400).json({ errorMessage: "유효하지 않은 냉장고 ID 형식입니다." });
        }

        const newItem = await shoppingListTodoService.createItem(
            Number(refrigeratorId),
            productName,
            Number(quantity) || 1,
        );

        return res.status(201).json({
            message: "장보기 목록에 추가되었습니다.",
            data: newItem,
        });
    } catch (error) {
        next(error);
    }
};

// 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
const getItems = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { refrigeratorId } = req.params;

        if (!refrigeratorId) {
            return res.status(400).json({ errorMessage: "냉장고 ID가 필요합니다." });
        }

        if (isNaN(Number(refrigeratorId))) {
            return res.status(400).json({ errorMessage: "유효하지 않은 냉장고 ID입니다." });
        }

        const items = await shoppingListTodoService.getItemsByRefrigeratorId(
            Number(refrigeratorId),
        );

        return res.status(200).json({ data: items });
    } catch (error) {
        next(error);
    }
};

// 3. 장보기 항목 수정 및 체크 (Update)
const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { itemId } = req.params;

        if (isNaN(Number(itemId))) {
            return res.status(400).json({ errorMessage: "유효하지 않은 항목 ID입니다." });
        }

        const { productName, quantity, isChecked } = req.body;

        const updateData: {
            productName?: string;
            quantity?: number;
            isChecked?: boolean;
        } = {};

        if (productName !== undefined) updateData.productName = String(productName);
        if (quantity !== undefined) updateData.quantity = Number(quantity);
        if (isChecked !== undefined) updateData.isChecked = Boolean(isChecked);

        const updatedItem = await shoppingListTodoService.updateItem(Number(itemId), updateData);

        return res.status(200).json({
            message: "장보기 항목이 성공적으로 수정되었습니다.",
            data: updatedItem,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_SHOPPING_ITEM") {
            return res.status(404).json({ errorMessage: "해당 장보기 항목을 찾을 수 없습니다." });
        }
        next(error);
    }
};

// 4. 장보기 항목 삭제 (Delete)
const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { itemId } = req.params;

        if (isNaN(Number(itemId))) {
            return res.status(400).json({ errorMessage: "유효하지 않은 항목 ID입니다." });
        }

        await shoppingListTodoService.deleteItem(Number(itemId));

        return res.status(200).json({ message: "장보기 항목이 성공적으로 삭제되었습니다." });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_SHOPPING_ITEM") {
            return res.status(404).json({ errorMessage: "해당 장보기 항목을 찾을 수 없습니다." });
        }
        next(error);
    }
};

export default {
    createItem,
    getItems,
    updateItem,
    deleteItem,
};
