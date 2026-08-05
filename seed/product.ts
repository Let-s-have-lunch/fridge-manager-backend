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

    // 1. 기존 데이터 초기화 (카테고리 삭제는 제외! 카테고리는 유지합니다)
    await prisma.product.deleteMany();
    await prisma.fridge.deleteMany();

    const user = await prisma.user.findFirst();

    if (!user) {
        throw new Error("DB에 유저가 없습니다! 앱에서 회원가입을 먼저 진행해주세요.");
    }

    // 2. 테스트용 냉장고 생성
    const fridge = await prisma.fridge.create({
        data: {
            name: "김밥정의 1호 냉장고",
            userId: user.id,
        },
    });

    // 3. 기존 DB에 있는 기본 카테고리 불러오기 (두 번째 시딩 파일이 만들어둔 것들)
    const vegCategory = await prisma.category.findFirst({ where: { name: "채소류" } });
    const dairyCategory = await prisma.category.findFirst({ where: { name: "유제품" } });
    const meatCategory = await prisma.category.findFirst({ where: { name: "육류/해산물" } });

    if (!vegCategory || !dairyCategory || !meatCategory) {
        throw new Error("카테고리가 없습니다. 카테고리 시딩을 먼저 진행해주세요!");
    }

    const vegId = vegCategory.id;
    const dairyId = dairyCategory.id;
    const meatId = meatCategory.id;

    // 4. 날짜 세팅 (통계 테스트용)
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 2);
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3);
    const safeDate = new Date(today);
    safeDate.setDate(today.getDate() + 10);
    const thisMonth = new Date(today);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    // 5. 제품(Product) 데이터 생성
    const productsData = [
        {
            name: "유통기한 임박 우유",
            categoryId: dairyId, // 불러온 카테고리 ID 사용
            fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED,
            quantity: 1,
            unit: Unit.L,
            price: 3000,
            expirationDate: threeDaysLater,
            status: ProductStatus.STORED,
        },
        {
            name: "상해버린 돼지고기",
            categoryId: meatId, // 불러온 카테고리 ID 사용
            fridgeId: fridge.id,
            storageType: StorageType.FROZEN,
            quantity: 600,
            unit: Unit.G,
            price: 15000,
            expirationDate: pastDate,
            status: ProductStatus.STORED,
        },
        {
            name: "싱싱한 대파",
            categoryId: vegId, // 불러온 카테고리 ID 사용
            fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED,
            quantity: 1,
            unit: Unit.EA,
            price: 2000,
            expirationDate: safeDate,
            status: ProductStatus.STORED,
        },
    ];

    await prisma.product.createMany({ data: productsData });

    await prisma.product.create({
        data: {
            name: "계란", categoryId: dairyId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 30, unit: Unit.EA,
            price: 8000, expirationDate: safeDate, status: ProductStatus.CONSUMED,
            updatedAt: thisMonth,
        }
    });

    await prisma.product.create({
        data: {
            name: "계란", categoryId: dairyId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 15, unit: Unit.EA,
            price: 4000, expirationDate: safeDate, status: ProductStatus.CONSUMED,
            updatedAt: thisMonth,
        }
    });

    await prisma.product.create({
        data: {
            name: "한우 등심", categoryId: meatId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 400, unit: Unit.G,
            price: 45000, expirationDate: safeDate, status: ProductStatus.CONSUMED,
            updatedAt: thisMonth,
        }
    });

    await prisma.product.create({
        data: {
            name: "양배추", categoryId: vegId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 1, unit: Unit.EA,
            price: 5000, expirationDate: pastDate, status: ProductStatus.DISCARDED,
            updatedAt: lastMonth,
        }
    });

    await prisma.product.create({
        data: {
            name: "두부", categoryId: vegId, fridgeId: fridge.id,
            storageType: StorageType.REFRIGERATED, quantity: 1, unit: Unit.EA,
            price: 1500, expirationDate: pastDate, status: ProductStatus.DISCARDED,
            updatedAt: thisMonth,
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