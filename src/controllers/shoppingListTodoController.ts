import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import shoppingListTodoService from "../services/shoppingListTodoService.ts";
import { ShoppingListInputType } from "../schemas/shoppingList/shoppingListTodoSchema.ts";


// 1. 장보기 항목 추가 (Create)
const createItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
        }

        // 💡 1. req.body가 비어있을 경우를 대비해 빈 객체를 기본값으로 둡니다.
        // 강제 타입 변환(as ...)을 제거하여 타입스크립트 충돌을 원천 차단합니다.
        const body = req.body || {};
        const productName = body.productName;
        const quantity = body.quantity;

        // 💡 2. URL 경로(/refrigerators/:refrigeratorId/...) 또는 바디에서 ID를 모두 찾습니다.
        const refrigeratorId = req.params.refrigeratorId || body.refrigeratorId;

        // 💡 3. 필수 값 방어 로직 (데이터가 없거나 타입이 이상하면 바로 차단)
        if (!refrigeratorId) {
            return res.status(400).json({ message: "냉장고 ID가 필요합니다." });
        }
        if (!productName || typeof productName !== "string" || productName.trim() === "") {
            return res.status(400).json({ message: "유효한 상품명이 필요합니다." });
        }

        // 💡 4. 숫자형 데이터 안전하게 변환
        const parsedRefrigeratorId = Number(refrigeratorId);
        if (isNaN(parsedRefrigeratorId)) {
            return res.status(400).json({ message: "냉장고 ID는 숫자여야 합니다." });
        }

        // quantity가 없거나 숫자가 아니면 무조건 기본값 1로 셋팅
        const parsedQuantity = (quantity !== undefined && !isNaN(Number(quantity)))
            ? Number(quantity)
            : 1;

        // 💡 5. 서비스 호출 (만약 여기서 에러가 난다면 서비스 함수의 인자 형태가 문제일 수 있습니다)
        const newItem = await shoppingListTodoService.createItem(
            parsedRefrigeratorId,
            productName,
            parsedQuantity
        );

        return res.status(201).json({
            message: "장보기 목록에 추가되었습니다.",
            data: newItem,
        });
    } catch (error) {
        // 에러 로그를 좀 더 상세히 찍어 추적이 쉽도록 변경
        console.error("createItem 실행 중 에러 발생:", error);
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
