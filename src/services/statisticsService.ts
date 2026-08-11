import prisma from "../config/prisma.ts";

const getDashboardData = async (
    fridgeIds: number[],
    thisMonthStart: Date,
    thisMonthEnd: Date,
    today: Date,
    threeDaysLater: Date,
) => {
    // 1. 상태별 통계
    const statusStats = await prisma.product.groupBy({
        by: ["status"],
        where: {
            fridgeId: { in: fridgeIds },
            updatedAt: { gte: thisMonthStart, lt: thisMonthEnd },
        },
        _count: { id: true },
        _sum: { price: true },
    });

    let totalItems = 0;
    let consumedCount = 0,
        discardedCount = 0,
        storedCount = 0;
    let totalConsumedPrice = 0;

    statusStats.forEach(stat => {
        const count = stat._count.id;
        totalItems += count;
        if (stat.status === "CONSUMED") {
            consumedCount = count;
            totalConsumedPrice = stat._sum.price || 0;
        } else if (stat.status === "DISCARDED") {
            discardedCount = count;
        } else if (stat.status === "STORED") {
            storedCount = count;
        }
    });

    const getPercent = (count: number) =>
        totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;

    // 2. 만료 임박 / 지남
    const expiredProducts = await prisma.product.findMany({
        where: { fridgeId: { in: fridgeIds }, status: "STORED", AND: [
                { expirationDate: { gte: thisMonthStart } }, // 💡 핵심: 선택한 달의 1일 이후
                { expirationDate: { lt: thisMonthEnd } },    // 💡 핵심: 선택한 달의 마지막 날 이전
                { expirationDate: { lt: today } }            // 기존: 오늘 날짜보다 과거 (지남)
            ] },
        select: {
            id: true,
            name: true,
            expirationDate: true,
            category: { select: { icon: true } } // 모달 리스트에 아이콘을 표시하기 위해 포함
        },
        orderBy: { expirationDate: "asc" }, // 기한이 많이 지난 순으로 정렬
    });

    const expiringSoonProducts = await prisma.product.findMany({
        where: {
            fridgeId: { in: fridgeIds },
            status: "STORED",
            AND: [
                { expirationDate: { gte: thisMonthStart } }, // 💡 핵심: 선택한 달의 1일 이후
                { expirationDate: { lt: thisMonthEnd } }, // 💡 핵심: 선택한 달의 마지막 날 이전
                { expirationDate: { gte: today } }, // 기존: 오늘 날짜 이후
                { expirationDate: { lte: threeDaysLater } }, // 기존: 오늘부터 3일 이내 (임박)
            ],
        },
        select: {
            id: true,
            name: true,
            expirationDate: true,
            category: { select: { icon: true } },
        },
        orderBy: { expirationDate: "asc" }, // 가장 임박한 순으로 정렬
    });

    // 3. TOP 3 (카테고리 아이콘 포함해서 가져오기)
    const topConsumedGroups = await prisma.product.groupBy({
        by: ["name"],
        where: {
            fridgeId: { in: fridgeIds },
            status: "CONSUMED",
            updatedAt: { gte: thisMonthStart, lt: thisMonthEnd },
        },
        _count: { name: true },
        _sum: { price: true },
        orderBy: [{ _count: { name: "desc" } }, { _sum: { price: "desc" } }],
        take: 3,
    });

    // 각 TOP 3 제품의 '카테고리 아이콘'을 알아내기 위해 실제 Product 데이터를 하나씩 찾아 매핑합니다.
    const top3Products = await Promise.all(
        topConsumedGroups.map(async (item) => {
            // 해당 이름의 소비된 제품 중 하나를 찾아 카테고리 정보를 포함하여 가져옴
            const sampleProduct = await prisma.product.findFirst({
                where: {
                    fridgeId: { in: fridgeIds },
                    status: "CONSUMED",
                    name: item.name,
                },
                include: {
                    category: true, // 👈 카테고리 통째로 조인!
                },
            });

            return {
                name: item.name,
                useCount: item._count.name,
                totalPrice: item._sum.price || 0,
                icon: sampleProduct?.category?.icon || "tag", // 👈 카테고리에 저장된 아이콘 이름 추출! (없으면 기본값)
            };
        })
    );

    return {
        dashboardResponse: {
            totalConsumedPrice,
            statusRates: {
                consumed: getPercent(consumedCount),
                discarded: getPercent(discardedCount),
                others: getPercent(storedCount),
            },
            expirationCards: {
                expired: expiredProducts.length, // 기존 UI용 개수
                expiringSoon: expiringSoonProducts.length, // 기존 UI용 개수
                // 모달에 넘겨줄 상세 리스트 (데이터 다듬기)
                expiredList: expiredProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    expirationDate: p.expirationDate,
                    icon: p.category?.icon || "dots-horizontal", // 아이콘 없으면 기본값
                })),
                expiringSoonList: expiringSoonProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    expirationDate: p.expirationDate,
                    icon: p.category?.icon || "dots-horizontal",
                })),
            },
            top3Products: top3Products,
        },
    };
};

// ==========================================
// 🛠️ [내부 헬퍼 2] 모달 데이터 추출 함수
// ==========================================
const getModalData = async (
    userId: number,
    fridgeIds: number[],
    thisMonthStart: Date,
    thisMonthEnd: Date,
    lastMonthStart: Date,
    lastMonthEnd: Date,
) => {
    // ==========================================
    // 🎯 [1] 카테고리별 소비 내역 (TOP 3 + 기타) - 기준: CONSUMED
    // ==========================================
    const categoryStats = await prisma.product.groupBy({
        by: ["categoryId"],
        where: {
            fridgeId: { in: fridgeIds },
            status: "CONSUMED",
            updatedAt: { gte: thisMonthStart, lt: thisMonthEnd },
            price: { not: null },
        },
        _sum: { price: true },
        orderBy: { _sum: { price: "desc" } },
    });

    const categories = await prisma.category.findMany({
        where: { OR: [{ isDefault: true }, { userId: userId }] },
    });

    let top3Categories: any[] = [];
    let othersPrice = 0;
    let totalConsumedPrice = 0; // 💡 모달 도넛 차트 가운데 들어갈 총액

    categoryStats.forEach((stat, index) => {
        const catName = categories.find(c => c.id === stat.categoryId)?.name || "알 수 없음";
        const sumPrice = stat._sum.price || 0;
        totalConsumedPrice += sumPrice; // 차트 총액 합산

        if (index < 3) {
            top3Categories.push({ name: catName, price: sumPrice });
        } else {
            othersPrice += sumPrice;
        }
    });
    if (othersPrice > 0) top3Categories.push({ name: "기타", price: othersPrice });

    // ==========================================
    // 🎯 [2] 절약 효과 (음식물 쓰레기 방어율) - 기준: DISCARDED
    // ==========================================
    // 1. 이번 달에 버린 돈 총합
    const thisMonthDiscarded = await prisma.product.aggregate({
        where: {
            fridgeId: { in: fridgeIds },
            status: "DISCARDED",
            updatedAt: { gte: thisMonthStart, lt: thisMonthEnd },
        },
        _sum: { price: true },
    });
    const thisMonthWaste = thisMonthDiscarded._sum.price || 0;

    // 2. 저번 달에 버린 돈 총합
    const lastMonthDiscarded = await prisma.product.aggregate({
        where: {
            fridgeId: { in: fridgeIds },
            status: "DISCARDED",
            updatedAt: { gte: lastMonthStart, lt: lastMonthEnd },
        },
        _sum: { price: true },
    });
    const lastMonthWaste = lastMonthDiscarded._sum.price || 0;

    // 3. 절약액 계산 (저번달 쓰레기 - 이번달 쓰레기)
    let savingAmount = 0;
    let savingPercentage = 0;

    if (lastMonthWaste > 0) {
        savingAmount = lastMonthWaste - thisMonthWaste; // 덜 버렸으면 플러스(+)
        savingPercentage = Math.round((savingAmount / lastMonthWaste) * 100);
    } else if (lastMonthWaste === 0 && thisMonthWaste > 0) {
        // 저번달엔 하나도 안 버렸는데 이번달엔 버렸다면 절약 실패 (마이너스)
        savingAmount = -thisMonthWaste;
        savingPercentage = -100;
    }

    // 4. 프론트엔드가 쓰기 편하게 포장해서 리턴
    return {
        totalConsumedPrice, // 도넛 차트 한가운데 들어갈 125,600원 텍스트용
        categoryChartData: top3Categories,
        savingEffect: {
            amount: Math.abs(savingAmount), // "23,000원" 텍스트 렌더링용 절대값
            isPositive: savingAmount >= 0, // true면 초록색(+), false면 빨간색(-) 칠하기용
            percentage: savingPercentage > 0 ? `+${savingPercentage}%` : `${savingPercentage}%`,
        },
    };
};

// ==========================================
// 🌟 [메인 함수] 컨트롤 타워 (이것만 export)
// ==========================================
const getUserStatistics = async (userId: number, year: number, month: number) => {
    // 1. 날짜 및 공통 데이터 세팅
    const thisMonthStart = new Date(year, month - 1, 1);
    const thisMonthEnd = new Date(year, month, 1);
    const lastMonthStart = new Date(year, month - 2, 1);
    const lastMonthEnd = new Date(year, month - 1, 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const myFridges = await prisma.fridge.findMany({
        where: { userId: userId },
        select: { id: true },
    });
    const fridgeIds = myFridges.map(f => f.id);

    // 2. 대시보드 헬퍼 함수 호출
    const { dashboardResponse } = await getDashboardData(
        fridgeIds,
        thisMonthStart,
        thisMonthEnd,
        today,
        threeDaysLater,
    );

    // 3. 모달 헬퍼 함수 호출 (대시보드에서 구한 총액을 넘겨줌)
    const modalResponse = await getModalData(
        userId,
        fridgeIds,
        thisMonthStart,
        thisMonthEnd,
        lastMonthStart,
        lastMonthEnd,
    );

    // 4. 최종 결과 병합 후 반환
    return {
        targetMonth: `${year}-${month}`,
        dashboardData: dashboardResponse,
        modalData: modalResponse,
    };
};

export default {getUserStatistics};