import prisma from "../config/prisma.ts";

const getFridgeList = async () => {
    return prisma.fridge.findMany({
        where: { deletedAt: null },
        orderBy: { id: "asc" },
    });
};

const createFridge = async (name: string) => {
    const existingFridge = await prisma.fridge.findFirst({
        where: {
            name: name,
            deletedAt: null,
        },
    });

    if (existingFridge) {
        throw new Error("ALREADY_EXISTS_NAME");
    }

    return prisma.fridge.create({
        data: {
            name,
        },
    });
};

// 3. 냉장고 수정 (존재 여부 및 내 아이디를 제외한 이름 중복 체크)
const updateFridge = async (id: number, name: string) => {
    const fridge = await prisma.fridge.findUnique({
        where: { id },
    });

    if (!fridge || fridge.deletedAt !== null) {
        throw new Error("NOT_FOUND_FRIDGE");
    }

    const existingFridge = await prisma.fridge.findFirst({
        where: {
            name: name,
            deletedAt: null,
            id: { not: id }, // 자기 자신은 중복 체크에서 제외
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

const deleteFridge = async (id: number) => {
    const fridge = await prisma.fridge.findFirst({
        where: {
            id,
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
