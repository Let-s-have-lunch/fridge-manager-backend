import { Request, Response, NextFunction } from "express";
import { ShoppingListTodoService } from "../services/shoppingListTodo.Service";

export class ShoppingListTodoController {
    private shoppingListTodoService = new ShoppingListTodoService();

    // 1. 장보기 항목 추가 (Create)
    public createItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { refrigeratorId, productName, quantity } = req.body;

            if (!refrigeratorId || !productName) {
                return res.status(400).json({ errorMessage: "냉장고 ID와 상품명은 필수입니다." });
            }

            // 💡 여기도 냉장고 ID가 숫자가 맞는지 살짝 검사해 주면 더 안전합니다!
            if (isNaN(Number(refrigeratorId))) {
                return res
                    .status(400)
                    .json({ errorMessage: "유효하지 않은 냉장고 ID 형식입니다." });
            }

            const newItem = await this.shoppingListTodoService.createItem(
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
    public getItems = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { refrigeratorId } = req.params;

            if (!refrigeratorId) {
                return res.status(400).json({ errorMessage: "냉장고 ID가 필요합니다." });
            }

            // 💡 조회할 때도 냉장고 ID가 숫자 형태인지 방어 코드 추가!
            if (isNaN(Number(refrigeratorId))) {
                return res.status(400).json({ errorMessage: "유효하지 않은 냉장고 ID입니다." });
            }

            const items = await this.shoppingListTodoService.getItemsByRefrigeratorId(
                Number(refrigeratorId),
            );

            return res.status(200).json({ data: items });
        } catch (error) {
            next(error);
        }
    };

    // 3. 장보기 항목 수정 및 체크 (Update - 투두의 핵심!)
    public updateItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { itemId } = req.params;

            // 🛡️ [방어 코드 추가] itemId가 숫자가 아니면 여기서 바로 차단!
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

            const updatedItem = await this.shoppingListTodoService.updateItem(
                Number(itemId),
                updateData,
            );

            return res.status(200).json({
                message: "장보기 항목이 성공적으로 수정되었습니다.",
                data: updatedItem,
            });
        } catch (error) {
            next(error);
        }
    };

    // 4. 장보기 항목 삭제 (Delete)
    public deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { itemId } = req.params;

            // 🛡️ [방어 코드 추가] 삭제할 때도 itemId가 숫자가 아니면 차단!
            if (isNaN(Number(itemId))) {
                return res.status(400).json({ errorMessage: "유효하지 않은 항목 ID입니다." });
            }

            await this.shoppingListTodoService.deleteItem(Number(itemId));

            return res.status(200).json({ message: "장보기 항목이 성공적으로 삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    };
}
