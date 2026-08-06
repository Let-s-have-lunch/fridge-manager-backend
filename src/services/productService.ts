import prisma from "../config/prisma.ts";
import { ProductInputType } from "../schemas/productSchema.ts";

const getProductList = async (userId: number, fridgeId: number) => {
    // 📢 [프론트엔드 팀원분들 필독!] 📢
    // 홈 화면의 탭(전체/냉장/냉동/실온)을 누를 때마다 API를 매번 호출하면 서버와 앱 모두 비효율적입니다.
    // 따라서 백엔드에서는 storageType(보관방식) 필터링 없이 해당 냉장고의 '전체' 제품 목록을 한 번에 내려줍니다.
    // 프론트엔드에서는 처음에 이 전체 리스트를 State에 한 번만 저장해 두고,
    // 탭을 전환할 때마다 자바스크립트의 .filter() 메서드를 사용해(ex: item.storageType === 'REFRIGERATED')
    // 조건에 맞는 데이터만 화면에 렌더링하는 방식으로 구현해 주세요!

    const products = await prisma.product.findMany({
        where: {
            fridgeId,
            status: "STORED",
            fridge: {
                userId,
            },
        },

        include: {
            category: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return products.map(product => {
        const expireDate = new Date(product.expirationDate);
        expireDate.setHours(0, 0, 0, 0);
        const dDay = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const { id, name, memo, quantity, unit, storageType, expirationDate, createdAt, category } =
            product;
        return {
            id,
            name,
            memo,
            quantity,
            unit,
            storageType,
            expirationDate,
            createdAt,
            dDay,
            category: {
                id: category.id,
                name: category.name,
                icon: category.icon,
            },
        };
    });
};

const getProductById = async (userId: number, productId: number) => {
    const product = await prisma.product.findFirst({
        where: { id: productId, fridge: { userId } },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    icon: true,
                },
            },
        }, // 상세 조회 시 카테고리 정보도 같이 넘겨줍니다
    });

    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }

    return product;
};

const createProduct = async (userId: number, fridgeId: number, data: ProductInputType) => {
    // 💡 내 냉장고가 맞는지 확인
    const targetFridge = await prisma.fridge.findFirst({
        where: { id: fridgeId, userId: userId },
    });
    if (!targetFridge) throw new Error("UNAUTHORIZED_ACCESS");

    return prisma.product.create({
        data: {
            fridgeId: fridgeId,
            categoryId: data.categoryId,
            name: data.name,
            storageType: data.storageType,
            quantity: data.quantity,
            unit: data.unit,
            price: data.price ?? null,
            expirationDate: data.expirationDate,
            memo: data.memo ?? null,
            // status는 스키마에 정의된 기본값(STORED, MANUAL)이 자동으로 들어갑니다.
        },
    });
};

const updateProduct = async (userId: number, productId: number, data: ProductInputType) => {
    // 수정 전 제품이 실제로 존재하는지 확인
    await getProductById(userId, productId);

    return prisma.product.update({
        where: { id: productId },
        data: {
            categoryId: data.categoryId,
            name: data.name,
            storageType: data.storageType,
            quantity: data.quantity,
            unit: data.unit,
            price: data.price ?? null,
            expirationDate: data.expirationDate,
            status: data.status,
            memo: data.memo ?? null,
        },
    });
};

const deleteProduct = async (userId: number, productId: number) => {
    // 삭제 전 제품이 실제로 존재하는지 확인
    await getProductById(userId, productId);

    // 제품 테이블(자식)은 하드 삭제(Hard Delete) 처리합니다
    return prisma.product.delete({
        where: { id: productId },
    });
};


export default {
    getProductList,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
