import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 💡 클래스 이름을 컨트롤러와 똑같이 'ShoppingListTodoService'로 맞춰줍니다!
export class ShoppingListTodoService {
    // 1. 장보기 항목 추가 (Create)
    public async createItem(refrigeratorId: number, productName: string, quantity: number) {
        const newItem = await prisma.shoppingList.create({
            data: {
                refrigeratorId,
                productName,
                quantity,
            },
        });
        return newItem;
    }

    // 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
    public async getItemsByRefrigeratorId(refrigeratorId: number) {
        const items = await prisma.shoppingList.findMany({
            where: {
                refrigeratorId: refrigeratorId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return items;
    }

    // 3. 장보기 항목 수정 및 체크 (Update)
    public async updateItem(
        itemId: number,
        updateData: { productName?: string; quantity?: number; isChecked?: boolean },
    ) {
        const updatedItem = await prisma.shoppingList.update({
            where: {
                id: itemId,
            },
            data: updateData,
        });
        return updatedItem;
    }

    // 4. 장보기 항목 삭제 (Delete)
    public async deleteItem(itemId: number) {
        await prisma.shoppingList.delete({
            where: {
                id: itemId,
            },
        });
    }
}
