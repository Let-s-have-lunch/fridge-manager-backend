import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import shoppingListTodoService from "../services/shoppingListTodoService.ts";
import { ShoppingListInputType } from "../schemas/shoppingList/shoppingListSchema.ts";

// 1. 장보기 항목 추가 (Create)
const createItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
        }

        // ShoppingListInputType을 안전하게 구조분해 할당합니다.
        const { refrigeratorId, productName, quantity } = req.body as ShoppingListInputType & {
            refrigeratorId: number;
        };

        if (!refrigeratorId || !productName) {
            return res.status(400).json({ message: "냉장고 ID와 상품명은 필수 입력 항목입니다." });
        }

        if (isNaN(Number(refrigeratorId))) {
            return res.status(400).json({ message: "유효하지 않은 냉장고 ID 형식입니다." });
        }

        const newItem = await shoppingListTodoService.createItem(
            Number(refrigeratorId),
            productName,
            quantity ?? 1,
        );

        return res.status(201).json({
            message: "장보기 목록에 추가되었습니다.",
            data: newItem,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "장보기 항목 등록 중 서버 오류가 발생했습니다.",
        });
    }
};

// 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
const getItems = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
        }

        const { refrigeratorId } = req.params;

        if (!refrigeratorId) {
            return res.status(400).json({ message: "냉장고 ID가 필요합니다." });
        }

        if (isNaN(Number(refrigeratorId))) {
            return res.status(400).json({ message: "유효하지 않은 냉장고 ID입니다." });
        }

        const items = await shoppingListTodoService.getItemsByRefrigeratorId(
            Number(refrigeratorId),
        );

        return res.status(200).json({
            message: "장보기 목록을 성공적으로 불러왔습니다.",
            data: items,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "장보기 목록 조회 중 서버 에러가 발생했습니다.",
        });
    }
};

// 3. 장보기 항목 수정 및 체크 (Update)
const updateItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
        }

        const itemId = Number(req.params.itemId);
        if (isNaN(itemId)) {
            return res.status(400).json({ message: "유효하지 않은 항목 ID입니다." });
        }

        const { productName, quantity, isChecked } = req.body;

        // 💡 값이 실제로 들어온 것들만 골라서 안전하게 객체로 조립합니다!
        // (이렇게 하면 undefined가 Prisma로 넘어가지 않아 타입 에러가 사라집니다)
        const updateData: {
            productName?: string;
            quantity?: number;
            isChecked?: boolean;
        } = {};

        if (productName !== undefined) updateData.productName = String(productName);
        if (quantity !== undefined) updateData.quantity = Number(quantity);
        if (isChecked !== undefined) updateData.isChecked = Boolean(isChecked);

        const updatedItem = await shoppingListTodoService.updateItem(itemId, updateData);

        if (!updatedItem) {
            return res.status(404).json({
                message: "해당 장보기 항목을 찾을 수 없습니다.",
            });
        }

        return res.status(200).json({
            message: "장보기 항목이 성공적으로 수정되었습니다.",
            data: updatedItem,
        });
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === "NOT_FOUND_SHOPPING_ITEM") {
            return res.status(404).json({
                message: "해당 장보기 항목을 찾을 수 없습니다.",
            });
        }
        return res.status(500).json({ message: "장보기 항목 수정 중 서버 에러가 발생했습니다." });
    }
};

// 4. 장보기 항목 삭제 (Delete - AuthRequest 제네릭 제거)
const deleteItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }

        const itemId = Number(req.params.itemId);
        if (isNaN(itemId)) {
            return res.status(400).json({ message: "유효하지 않은 항목 ID입니다." });
        }

        await shoppingListTodoService.deleteItem(itemId);

        return res.status(200).json({
            message: "장보기 항목이 성공적으로 삭제되었습니다.",
        });
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === "NOT_FOUND_SHOPPING_ITEM") {
            return res.status(404).json({
                message: "해당 장보기 항목을 찾을 수 없습니다.",
            });
        }
        return res.status(500).json({
            message: "장보기 항목 삭제 중 오류가 발생했습니다.",
        });
    }
};

export default {
    createItem,
    getItems,
    updateItem,
    deleteItem,
};
