import { Request, Response, NextFunction } from "express";
// 방금 만든 서비스 파일을 불러옵니다.
import { ShoppingListTodoService } from "../services/shoppingListTodo.Service";

export class ShoppingListTodoController {
    // 서비스 클래스를 불러와서 일 시킬 준비를 합니다.
    private shoppingListTodoService = new ShoppingListTodoService();

    // 1. 장보기 항목 추가 (Create)
    public createItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            // 프론트엔드에서 보낸 데이터(body)
            const { refrigeratorId, productName, quantity } = req.body;

            // 데이터가 잘 왔는지 확인 (방어 코드)
            if (!refrigeratorId || !productName) {
                return res.status(400).json({ errorMessage: "냉장고 ID와 상품명은 필수입니다." });
            }

            // 서비스에게 DB 저장을 지시
            const newItem = await this.shoppingListTodoService.createItem(
                Number(refrigeratorId),
                productName,
                Number(quantity) || 1, // 수량이 안 들어오면 기본값 1개로 세팅
            );

            return res.status(201).json({
                message: "장보기 목록에 추가되었습니다.",
                data: newItem,
            });
        } catch (error) {
            next(error); // 에러 발생 시 에러 핸들러로 전달
        }
    };

    // 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
    public getItems = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            // URL 파라미터에서 냉장고 번호 꺼내기
            const { refrigeratorId } = req.params;

            if (!refrigeratorId) {
                return res.status(400).json({ errorMessage: "냉장고 ID가 필요합니다." });
            }

            // 서비스에게 목록 조회 지시
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
            const { productName, quantity, isChecked } = req.body;

            // 💡 해결 방법: TS가 안심하도록 타입을 확실하게 변환(String, Number, Boolean)해서 전달합니다.
            const updateData = {
                productName: productName ? String(productName) : undefined,
                quantity: quantity ? Number(quantity) : undefined,
                // isChecked는 false 값도 의미가 있으므로 undefined가 아닐 때만 boolean으로 변환
                isChecked: isChecked !== undefined ? Boolean(isChecked) : undefined,
            };

            const updatedItem = await this.shoppingListTodoService.updateItem(
                Number(itemId),
                updateData, // 깔끔하게 포장된 객체를 서비스로 넘깁니다.
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
            const { itemId } = req.params; // 삭제할 항목 번호

            // 서비스에게 삭제 지시
            await this.shoppingListTodoService.deleteItem(Number(itemId));

            return res.status(200).json({ message: "장보기 항목이 성공적으로 삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    };
}
