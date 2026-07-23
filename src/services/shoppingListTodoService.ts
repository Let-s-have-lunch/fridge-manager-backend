import prisma from "../utils/prisma.ts";
import { ShoppingListInputType } from "../schemas/shoppingList/shoppingListTodoSchema.ts";

// 🌟 하루 단위 조회 (특정 날짜 하루를 쿼리로 받아 조회, id 기준 오름차순 정렬)
const getItems = async (userId: number, targetDate: Date) => {
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    return prisma.shoppingList.findMany({
        where: {
            userId,
            date: {
                gte: start,
                lte: end,
            },
        },
        orderBy: {
            id: "asc", // 👈 먼저 등록한 게 위로 올라오도록 수정
        },
    });
};

const createItem = async (itemData: ShoppingListInputType, userId: number) => {
    return prisma.shoppingList.create({
        data: {
            memo: itemData.memo,
            date: new Date(itemData.date),
            isChecked: false,
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
        throw new Error("NOT_FOUND_ITEM"); // 👈 낫파운드 에러 처리 적용 완료
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
