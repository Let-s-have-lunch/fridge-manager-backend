// Prisma Client를 불러와서 DB와 연결할 준비를 합니다.
// @ts-ignore
import { PrismaClient } from "@prisma/client";

export class ShoppingListTodoService {
    // Prisma를 사용할 수 있게 인스턴스를 만듭니다.
    private prisma = new PrismaClient();

    // 1. 장보기 항목 추가 (Create)
    public createItem = async (refrigeratorId: number, productName: string, quantity: number) => {
        // DB의 shopping_lists 테이블(Prisma에서는 shoppingList)에 데이터를 생성합니다.
        const newItem = await this.prisma.shoppingList.create({
            data: {
                refrigeratorId,
                productName,
                quantity,
            },
        });
        return newItem; // 만들어진 데이터를 컨트롤러로 돌려줍니다.
    };

    // 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
    public getItemsByRefrigeratorId = async (refrigeratorId: number) => {
        const items = await this.prisma.shoppingList.findMany({
            where: {
                refrigeratorId: refrigeratorId, // 이 냉장고 ID를 가진 항목만 다 찾기!
            },
            orderBy: {
                createdAt: "desc", // 최근에 추가한 것부터 맨 위에 오도록 정렬 (선택 사항)
            },
        });
        return items;
    };

    // 3. 장보기 항목 수정 및 체크 (Update)
    public updateItem = async (
        itemId: number,
        updateData: { productName?: string; quantity?: number; isChecked?: boolean },
    ) => {
        // 체크박스를 누르거나(isChecked), 내용을 수정할 때 모두 이 로직을 탑니다.
        const updatedItem = await this.prisma.shoppingList.update({
            where: {
                id: itemId, // 수정할 항목의 번호
            },
            data: updateData, // 프론트에서 넘어온 수정 내용(부분 업데이트 가능)
        });
        return updatedItem;
    };

    // 4. 장보기 항목 삭제 (Delete)
    public deleteItem = async (itemId: number) => {
        // 다 샀거나 지우고 싶은 항목 삭제
        await this.prisma.shoppingList.delete({
            where: {
                id: itemId,
            },
        });
    };
}
