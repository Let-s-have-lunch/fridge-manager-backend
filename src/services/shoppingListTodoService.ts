import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. 장보기 항목 추가 (Create)
const createItem = async (refrigeratorId: number, productName: string, quantity: number) => {
    const newItem = await prisma.shoppingList.create({
        data: {
            refrigeratorId,
            productName,
            quantity,
        },
    });
    return newItem;
};

// 2. 특정 냉장고의 장보기 목록 전체 조회 (Read)
const getItemsByRefrigeratorId = async (refrigeratorId: number) => {
    const items = await prisma.shoppingList.findMany({
        where: {
            refrigeratorId: refrigeratorId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return items;
};

// 3. 장보기 항목 수정 및 체크 (Update)
const updateItem = async (
    itemId: number,
    updateData: { productName?: string; quantity?: number; isChecked?: boolean },
) => {
    const existingItem = await prisma.shoppingList.findUnique({
        where: { id: itemId },
    });

    if (!existingItem) {
        throw new Error("NOT_FOUND_SHOPPING_ITEM");
    }

    const updatedItem = await prisma.shoppingList.update({
        where: {
            id: itemId,
        },
        data: updateData,
    });
    return updatedItem;
};

// 4. 장보기 항목 삭제 (Delete)
const deleteItem = async (itemId: number) => {
    const existingItem = await prisma.shoppingList.findUnique({
        where: { id: itemId },
    });

    if (!existingItem) {
        throw new Error("NOT_FOUND_SHOPPING_ITEM");
    }

    await prisma.shoppingList.delete({
        where: {
            id: itemId,
        },
    });
};

// 💡 원하시던 맨 밑에 묶어서 내보내기!
export default {
    createItem,
    getItemsByRefrigeratorId,
    updateItem,
    deleteItem,
};
