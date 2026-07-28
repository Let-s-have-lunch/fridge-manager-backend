import prisma from "../config/prisma.ts";

const getFridgeList = async (userId: number) => {
    return prisma.fridge.findMany({
        where: {
            userId,
            deletedAt: null,
        },
        orderBy: { id: "asc" },
    });
};

const createFridge = async (userId: number, name: string) => {
    const existingFridge = await prisma.fridge.findFirst({
        where: {
            userId,
            name: name,
            deletedAt: null,
        },
    });

    if (existingFridge) {
        throw new Error("ALREADY_EXISTS_NAME");
    }

    return prisma.fridge.create({
        data: {
            userId,
            name,
        },
    });
};

// 3. 냉장고 수정 (내 냉장고 존재 여부 확인 및 본인 냉장고 내 중복 체크)
const updateFridge = async (userId: number, id: number, name: string) => {
    // 내 냉장고인지 권한 및 존재 여부 검사
    const fridge = await prisma.fridge.findFirst({
        where: {
            id,
            userId,
            deletedAt: null,
        },
    });

    if (!fridge) {
        throw new Error("NOT_FOUND_FRIDGE");
    }

    // 변경하려는 이름이 내 다른 냉장고와 중복되는지 검사
    const existingFridge = await prisma.fridge.findFirst({
        where: {
            userId,
            name: name,
            deletedAt: null,
            id: { not: id }, // 자기 자신은 제외
        },
    });

    if (existingFridge) {
        throw new Error("ALREADY_EXISTS_NAME");
    }

    return prisma.fridge.update({
        where: { id },
        data: {
            name,
        },
    });
};

const deleteFridge = async (userId: number, id: number) => {
    const fridge = await prisma.fridge.findFirst({
        where: {
            id,
            userId,
            deletedAt: null,
        },
    });

    if (!fridge) {
        throw new Error("NOT_FOUND_FRIDGE");
    }

    return prisma.fridge.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
};

export default {
    getFridgeList,
    createFridge,
    updateFridge,
    deleteFridge,
};
