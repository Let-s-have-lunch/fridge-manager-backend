import prisma from "../config/prisma.ts";
import {
    ShoppingListInputType,
    ShoppingListUpdateInputType,
} from "../schemas/shoppingList/shoppingListTodoSchema.ts";

// 1. 특정 냉장고의 장보기 목록 조회
const getItemsByRefrigeratorId = async (refrigeratorId: number) => {
    return prisma.shoppingList.findMany({
        where: {
            refrigeratorId,
        },
        orderBy: {
            id: "asc",
        },
    });
};

// 2. 장보기 항목 추가 (input 객체 하나로 받도록 수정)
const createItem = async (refrigeratorId: number, productName: string, p0: number) => {
    return prisma.shoppingList.create({
        data: {
            refrigeratorId,
            productName: input.productName,
            quantity: input.quantity ?? 1,
            isChecked: input.isChecked ?? false,
        },
    });
};

// 3. 장보기 항목 수정 (undefined 에러 방지)
const updateItem = async (itemId: number, input: ShoppingListUpdateInputType) => {
    return prisma.shoppingList.update({
        where: {
            id: itemId,
        },
        data: {
            ...(input.productName !== undefined && { productName: input.productName }),
            ...(input.quantity !== undefined && { quantity: input.quantity }),
            ...(input.isChecked !== undefined && { isChecked: input.isChecked }),
            ...(input.refrigeratorId !== undefined && { refrigeratorId: input.refrigeratorId }),
        },
    });
};

// 4. 장보기 항목 삭제
const deleteItem = async (itemId: number) => {
    return prisma.shoppingList.delete({
        where: {
            id: itemId,
        },
    });
};

// 5. 체크 상태 토글 (추가 기능)
const toggleItem = async (refrigeratorId: number, itemId: number) => {
    const item = await prisma.shoppingList.findFirst({
        where: {
            id: itemId,
            refrigeratorId,
        },
    });

    if (!item) {
        throw new Error("NOT_FOUND_SHOPPING_ITEM");
    }

    return prisma.shoppingList.update({
        where: {
            id: itemId,
        },
        data: {
            isChecked: !item.isChecked,
        },
    });
};

export default {
    getItemsByRefrigeratorId,
    createItem,
    updateItem,
    deleteItem,
    toggleItem,
};
