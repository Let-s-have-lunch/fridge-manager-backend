import prisma from "../utils/prisma.ts";
import { ShoppingListInputType } from "../schemas/shoppingList/shoppingListTodoSchema.ts";

// 🌟 주 단위 조회 (기존 getTodoListByRange 구조를 그대로 활용)
const getItems = async (userId: number, startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const nextDayOfEnd = new Date(endDate);
    nextDayOfEnd.setHours(0, 0, 0, 0);
    nextDayOfEnd.setDate(nextDayOfEnd.getDate() + 1);

    return prisma.shoppingList.findMany({
        where: {
            userId,
            date: {
                gte: start,
                lt: nextDayOfEnd,
            },
        },
        orderBy: {
            date: "asc",
        },
    });
};

const createItem = async (itemData: ShoppingListInputType, userId: number) => {
    return prisma.shoppingList.create({
        data: {
            memo: itemData.memo,
            date: new Date(itemData.date),
            isChecked: itemData.isChecked ?? false,
            user: { connect: { id: userId } },
        },
    });
};

const updateItem = async (userId: number, itemId: number, input: ShoppingListInputType) => {
    const item = await prisma.shoppingList.findFirst({
        where: {
            id: itemId,
            userId,
        },
    });

    if (!item) {
        return null;
    }

    return prisma.shoppingList.update({
        where: {
            id: itemId,
        },
        data: {
            ...input,
        },
    });
};

const deleteItem = async (id: number, userId: number) => {
    const item = await prisma.shoppingList.findFirst({
        where: {
            id,
            userId,
        },
    });

    if (!item) {
        throw new Error("NOT_FOUND_ITEM");
    }

    return prisma.shoppingList.delete({
        where: {
            id,
        },
    });
};

const toggleTodo = async (userId: number, itemId: number) => {
    const item = await prisma.shoppingList.findFirst({
        where: {
            id: itemId,
            userId,
        },
    });

    if (!item) {
        throw new Error("NOT_FOUND_ITEM");
    }

    const newStatus = !item.isChecked;

    return prisma.shoppingList.update({
        where: {
            id: itemId,
        },
        data: {
            isChecked: newStatus,
        },
    });
};

export default {
    getItems,
    createItem,
    updateItem,
    deleteItem,
    toggleTodo,
};
