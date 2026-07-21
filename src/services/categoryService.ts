import prisma from "../config/prisma.ts";

const getCategoryList = async () => {
    return prisma.category.findMany({
        where: { deletedAt: null },
        orderBy: { id: "asc" },
    });
};

const createCategory = async (name: string) => {
    const exist = await prisma.category.findFirst({
        where: { name, deletedAt: null },
    });
    if (exist) throw new Error("DUPLICATED_CATEGORY");

    return prisma.category.create({ data: { name } });
};

const updateCategory = async (categoryId: number, name: string) => {
    // 1. 카테고리가 존재하는지 (그리고 삭제되지 않았는지) 확인
    const target = await prisma.category.findFirst({
        where: { id: categoryId, deletedAt: null },
    });
    if (!target) throw new Error("CATEGORY_NOT_FOUND");

    // 2. 변경하려는 이름이 이미 존재하는지 확인 (단, 현재 수정 중인 내 카테고리는 제외)
    const exist = await prisma.category.findFirst({
        where: {
            name,
            deletedAt: null,
            id: { not: categoryId }, // 중복 검사에서 자기 자신은 제외
        },
    });
    if (exist) throw new Error("DUPLICATED_CATEGORY");

    // 3. 이름 업데이트
    return prisma.category.update({
        where: { id: categoryId },
        data: { name },
    });
};

const deleteCategory = async (categoryId: number) => {
    // 1. 카테고리가 존재하는지 확인
    const target = await prisma.category.findFirst({
        where: { id: categoryId, deletedAt: null },
    });
    if (!target) throw new Error("CATEGORY_NOT_FOUND");

    // 2. 하드 삭제(delete)가 아닌 소프트 삭제(Update) 적용
    return prisma.category.update({
        where: { id: categoryId },
        data: { deletedAt: new Date() },
    });
};

export default { getCategoryList, createCategory, updateCategory, deleteCategory };
