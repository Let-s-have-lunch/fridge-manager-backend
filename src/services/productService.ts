import prisma from "../config/prisma.ts";
import { ProductInputType } from "../schemas/productSchema.ts";

const getProductList = async (fridgeId: number, sort?: string, keyword?: string) => {
    let orderByCondition: any = { createdAt: "desc" };

    // 정렬 기준이 있을때
    if (sort === "expire") {
        orderByCondition = { expirationDate: "asc" };
    } else if (sort === "category") {
        orderByCondition = { categoryId: "asc" };
    }

    return prisma.product.findMany({
        where: {
            fridgeId: fridgeId,
            status: "STORED",

            // (keyword가 있을 때만 name 속성을 객체에 추가합니다)
            ...(keyword && { name: { contains: keyword } }),
        },
        orderBy: orderByCondition,
        include: {
            category: true,
        },
    });
};


const getFridgeStatistics = async (fridgeId: number, year: number, month: number) => {
    // 1. 해당 월의 시작일과 다음 월의 시작일 계산 (예: 7월이면 7월 1일 ~ 8월 1일 직전까지)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // 2. 소비 / 폐기 통계 (선택한 달에 업데이트된 데이터만 가져오기)
    const consumedCount = await prisma.product.count({
        where: {
            fridgeId: fridgeId,
            status: "CONSUMED",
            updatedAt: { gte: startDate, lt: endDate }, // startDate 이상, endDate 미만
        },
    });

    const discardedCount = await prisma.product.count({
        where: {
            fridgeId: fridgeId,
            status: "DISCARDED",
            updatedAt: { gte: startDate, lt: endDate },
        },
    });

    // 3. 자주 소비하는 Top 3 (선택한 달 기준)
    const topConsumed = await prisma.product.groupBy({
        by: ["name"],
        where: {
            fridgeId: fridgeId,
            status: "CONSUMED",
            updatedAt: { gte: startDate, lt: endDate },
        },
        _count: { name: true },
        // 👇 orderBy를 배열로 만들어서 1순위, 2순위 조건을 줍니다!
        orderBy: [
            { _count: { name: "desc" } }, // 1순위: 소비 개수가 많은 순 (내림차순)
            { name: "desc" }, // 2순위: 개수가 같다면 이름순 (내림차순)
        ],
        take: 3,
    });

    // 4. 유통기한 카드 (이 부분은 달력 선택과 무관하게 항상 '오늘'을 기준으로 경고해주는 용도)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. 임박 기준인 '3일 뒤'도 똑같이 세팅합니다.
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    // 3. 기한 지남 (Expired)
    // 오늘 자정(00:00:00)보다 작음 == "어제 또는 그 이전 날짜"
    const expiredProducts = await prisma.product.findMany({
        where: {
            fridgeId: fridgeId,
            status: "STORED",
            expirationDate: { lt: today },
        },
    });

    // 4. 기한 임박 (Expiring Soon)
    // 오늘 자정(00:00:00)보다 크거나 같고, 3일 뒤보다 작거나 같음
    // == "오늘 기한인 상품도 여기에 안전하게 포함됨! (D-Day)"
    const expiringSoonProducts = await prisma.product.findMany({
        where: {
            fridgeId: fridgeId,
            status: "STORED",
            expirationDate: { gte: today, lte: threeDaysLater },
        },
    });

    return {
        targetMonth: `${year}-${month}`, // 현재 조회된 기준 월을 프론트엔드에 확인용으로 내려줌
        chartData: { consumed: consumedCount, discarded: discardedCount },
        cards: {
            expired: expiredProducts,
            expiringSoon: expiringSoonProducts,
        },
        top3: topConsumed.map(item => ({ name: item.name, count: item._count.name })),
    };
};

const getProductById = async (productId: number) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }, // 상세 조회 시 카테고리 정보도 같이 넘겨줍니다
    });

    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }

    return product;
};

const createProduct = async (fridgeId: number, data: ProductInputType) => {
    return prisma.product.create({
        data: {
            fridgeId: fridgeId,
            categoryId: data.categoryId,
            name: data.name,
            storageType: data.storageType,
            quantity: data.quantity,
            unit: data.unit,
            expirationDate: data.expirationDate,
            addMethod: data.addMethod,
            memo: data.memo ?? null,
            // status는 스키마에 정의된 기본값(STORED, MANUAL)이 자동으로 들어갑니다.
        },
    });
};

const updateProduct = async (productId: number, data: ProductInputType) => {
    // 수정 전 제품이 실제로 존재하는지 확인
    await getProductById(productId);

    return prisma.product.update({
        where: { id: productId },
        data: {
            categoryId: data.categoryId,
            name: data.name,
            storageType: data.storageType,
            quantity: data.quantity,
            unit: data.unit,
            expirationDate: data.expirationDate,
            status: data.status,
            memo: data.memo ?? null,
        },
    });
};

const deleteProduct = async (productId: number) => {
    // 삭제 전 제품이 실제로 존재하는지 확인
    await getProductById(productId);

    // 제품 테이블(자식)은 하드 삭제(Hard Delete) 처리합니다
    return prisma.product.delete({
        where: { id: productId },
    });
};

const createProductsByReceipt = async (fridgeId: number, imageFile: Express.Multer.File) => {
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
    getFridgeStatistics,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductsByReceipt,
};
