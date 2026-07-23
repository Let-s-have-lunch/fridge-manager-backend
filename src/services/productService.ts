import prisma from "../config/prisma.ts";
import { ProductInputType } from "../schemas/productSchema.ts";

const getProductList = async (
    userId: number,
    fridgeId: number,
    sort?: string,
    keyword?: string,
) => {
    // 기본 정렬 기준 (최근 생성한게 위로 올라오게)
    let orderByCondition: any = { createdAt: "desc" };

    // 정렬 기준이 있을때
    if (sort === "expire") {
        orderByCondition = { expirationDate: "asc" };
    } else if (sort === "category") {
        orderByCondition = { categoryId: "asc" };
    }

    // 1. DB에서 전체 제품 목록 조회
    // 냉장, 냉동, 상온별로
    const products = await prisma.product.findMany({
        where: {
            fridgeId: fridgeId,
            fridge: { userId: userId },
            status: "STORED",
            ...(keyword && { name: { contains: keyword } }),
        },
        orderBy: orderByCondition,
        include: {
            category: true,
        },
    });

    // 2. 디데이(D-Day) 계산 로직
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return products.map(product => {
        let dDay = null;

        if (product.expirationDate) {
            const expireDate = new Date(product.expirationDate);
            expireDate.setHours(0, 0, 0, 0);

            const diffTime = expireDate.getTime() - today.getTime();
            dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
            ...product,
            dDay,
        };
    });
};



const getProductById = async (userId: number, productId: number) => {
    const product = await prisma.product.findFirst({
        where: { id: productId, fridge: { userId: userId } },
        include: { category: true }, // 상세 조회 시 카테고리 정보도 같이 넘겨줍니다
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
            addMethod: data.addMethod,
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

const createProductsByReceipt = async (
    userId: number,
    fridgeId: number,
    imageFile: Express.Multer.File,
) => {
    // 💡 1. 영수증을 등록하려는 냉장고가 내 냉장고가 맞는지 먼저 검증!
    const targetFridge = await prisma.fridge.findFirst({
        where: { id: fridgeId, userId: userId },
    });
    if (!targetFridge) throw new Error("UNAUTHORIZED_ACCESS");

    // [TODO] 실제 OCR 연동 시 아래 주석 해제 및 적용
    // const ocrResult = await callNaverOcrApi(imageFile.buffer);
    // 실제로 ocrResult에 객체 형태의 복잡한 데이터가 저장이 된다.
    // 거기서 '상품 목록' 배열이 있는 위치까지 찾아들어가서 아래의 parsedItems에 저장을 한다.!

    // 임시 모의 데이터 (OCR이 아래처럼 텍스트를 추출했다고 가정)
    const parsedItems = [
        { name: "서울우유 1L", quantity: 1, unit: "L" },
        { name: "양파 1망", quantity: 1, unit: "EA" },
        { name: "돼지고기 삼겹살", quantity: 600, unit: "G" },
    ];

    // DB 저장을 위한 데이터 맵핑
    const productsToCreate = parsedItems.map(item => ({
        fridgeId: fridgeId,
        categoryId: 9, // ect 카테고리 id
        name: item.name,
        storageType: "REFRIGERATED" as const, // 기본값 냉장
        quantity: item.quantity,
        unit: item.unit as "L" | "EA" | "G" | "KG" | "ML",
        expirationDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 기본 +7일
        addMethod: "RECEIPT" as const, // 영수증 스캔으로 들어온 데이터임을 명시
        status: "STORED" as const,
    }));

    // 다중 등록 실행
    const result = await prisma.product.createMany({
        data: productsToCreate,
    });

    // 프론트엔드에 방금 등록된 영수증 상품들만 내려주기 위해 재조회
    return prisma.product.findMany({
        where: {
            fridgeId: fridgeId,
            addMethod: "RECEIPT",
        },
        orderBy: { createdAt: "desc" },
        take: result.count, // 방금 생성된 개수만큼만 가져옴
    });
};

export default {
    getProductList,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductsByReceipt,
};
