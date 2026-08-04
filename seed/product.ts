// 확인용 product 생성 씨드 파일입니다. 나중에 개발이 끝나고나면 삭제해도 됩니다.

import {
    ProductStatus,
    RoleType,
    StorageType,
    Unit,
} from "../src/generated/prisma/enums.ts";
import prisma from "../src/config/prisma.ts";


async function main() {
    console.log("🌱 데이터 시딩을 시작합니다...");

    // 1. 기존 데이터 초기화 (외래키 제약조건 때문에 자식부터 삭제)
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.fridge.deleteMany();

    const user = await prisma.user.findFirst();

    if (!user) {
        throw new Error("DB에 유저가 없습니다! 앱에서 회원가입을 먼저 진행해주세요.");
    }

    // 3. 테스트용 냉장고 생성
    const fridge = await prisma.fridge.create({
        data: {
            name: "김밥정의 1호 냉장고",
            userId: user.id,
        },
    });

    // 4. 기본 카테고리 생성
    const categoryNames = ["채소", "유제품", "육류", "과일", "기타"];
    const createdCategories = [];
    for (const name of categoryNames) {
        const category = await prisma.category.create({
            data: {
                name: name,
                isDefault: true,
                icon: "star-outline",
            },
        });
        createdCategories.push(category);
    }

    // [카테고리 ID 추출]
    const vegId = createdCategories.find(c => c.name === "채소")!.id;
    const dairyId = createdCategories.find(c => c.name === "유제품")!.id;
    const meatId = createdCategories.find(c => c.name === "육류")!.id;

    // 5. 날짜 세팅 (통계 테스트용)
    const today = new Date();

    // 유통기한 계산용
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 2); // 임박 (2일 뒤)
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3); // 지남 (3일 전)
    const safeDate = new Date(today);
    safeDate.setDate(today.getDate() + 10); // 넉넉함 (10일 뒤)

    // 소비/폐기 (updatedAt) 계산용
    const thisMonth = new Date(today); // 이번 달
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1); // 저번 달

    // 6. 제품(Product) 데이터 생성
    const productsData = [
        // ==========================================
        // 🎯 [상태: STORED] - 대시보드 유통기한 카드 테스트용
        // ==========================================
        {
            name: "유통기한 임박 우유",
            categoryId: dairyId,
            fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED,
            quantity: 1,
            unit: Unit.L,
            price: 3000,
            expirationDate: threeDaysLater, // 임박!
            status: ProductStatus.STORED,
        },
        {
            name: "상해버린 돼지고기",
            categoryId: meatId,
            fridgeId: fridge.id,
            storageType: StorageType.FROZEN,
            quantity: 600,
            unit: Unit.G,
            price: 15000,
            expirationDate: pastDate, // 지남!
            status: ProductStatus.STORED,
        },
        {
            name: "싱싱한 대파",
            categoryId: vegId,
            fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED,
            quantity: 1,
            unit: Unit.EA,
            price: 2000,
            expirationDate: safeDate, // 넉넉함
            status: ProductStatus.STORED,
        },

        // ==========================================
        // 🎯 [상태: CONSUMED] - 이번달 총 소비액 및 TOP 3 테스트용
        // ==========================================
        // (주의: createMany에서는 updatedAt을 강제로 지정할 수 없으므로, 개별 create로 만듭니다)
    ];

    // 일반 STORED 데이터 먼저 삽입
    await prisma.product.createMany({ data: productsData });

    // 이번 달 소비 내역 (totalConsumedPrice, top3Products 계산용)
    await prisma.product.create({
        data: {
            name: "계란", categoryId: dairyId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 30, unit: Unit.EA,
            price: 8000, expirationDate: safeDate, status: ProductStatus.CONSUMED,
            updatedAt: thisMonth, // 이번 달에 다 먹음
        }
    });

    await prisma.product.create({
        data: {
            name: "계란", categoryId: dairyId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 15, unit: Unit.EA,
            price: 4000, expirationDate: safeDate, status: ProductStatus.CONSUMED,
            updatedAt: thisMonth, // 이번 달에 또 먹음 (TOP 3 테스트용)
        }
    });

    await prisma.product.create({
        data: {
            name: "한우 등심", categoryId: meatId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 400, unit: Unit.G,
            price: 45000, expirationDate: safeDate, status: ProductStatus.CONSUMED,
            updatedAt: thisMonth, // 이번 달에 비싼거 먹음
        }
    });

    // ==========================================
    // 🎯 [상태: DISCARDED] - 절약 효과(모달) 테스트용
    // ==========================================
    // 저번 달에 버린 것 (비교용)
    await prisma.product.create({
        data: {
            name: "양배추", categoryId: vegId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 1, unit: Unit.EA,
            price: 5000, expirationDate: pastDate, status: ProductStatus.DISCARDED,
            updatedAt: lastMonth, // 저번 달에 버림 (lastMonthWaste = 5000)
        }
    });

    // 이번 달에 버린 것
    await prisma.product.create({
        data: {
            name: "두부", categoryId: vegId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 1, unit: Unit.EA,
            price: 1500, expirationDate: pastDate, status: ProductStatus.DISCARDED,
            updatedAt: thisMonth, // 이번 달에 버림 (thisMonthWaste = 1500) -> 3500원 절약!
        }
    });

    console.log("✅ 데이터 시딩이 성공적으로 완료되었습니다!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });