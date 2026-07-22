import prisma from "../src/config/prisma.ts";

// 🌱 기본 9개의 공통 카테고리를 DB에 세팅(Seeding)합니다.
// 아래에 생성한 9개의 카테고리는 isDefault = true (관리자 제공 기본 카테고리)로 생성되며,
// 사용자가 앱에서 직접 추가하는 커스텀 카테고리는 isDefault = false 로 저장됩니다.

// 💡 [프론트엔드 사용 가이드]
// 백엔드의 GET API를 호출하면 "기본 카테고리(9개) + 해당 유저가 직접 만든 카테고리"가 합쳐진 배열이 응답으로 옵니다.
// 프론트엔드에서는 이 배열을 받아 filter 메소드를 이용해 두 그룹으로 나눕니다:
// 1. item.isDefault === true 인 배열: 화면 상단에 아이콘과 함께 고정 노출
// 2. item.isDefault === false 인 배열: 그 아래에 사용자가 등록한 카테고리 목록으로 노출


const initialCategories = [
    { id: 1, name: "채소류", icon: "carrot" },
    { id: 2, name: "과일류", icon: "fruit-cherries" },
    { id: 3, name: "육류/해산물", icon: "food-steak" },
    { id: 4, name: "유제품", icon: "cheese" },
    { id: 5, name: "가공식품", icon: "food-hot-dog" },
    { id: 6, name: "양념/소스류", icon: "shaker-outline" },
    { id: 7, name: "반찬류/조리된 음식", icon: "pot-steam" },
    { id: 8, name: "음료", icon: "cup-water" },
    { id: 9, name: "빵/베이커리류", icon: "bread-slice" },
    { id: 10, name: "간식/과자류", icon: "candy-outline" },
    { id: 11, name: "건강/다이어트식", icon: "leaf" },
    { id: 12, name: "약품/영양제", icon: "pill" }, // 💡 약품 추가
    { id: 13, name: "화장품", icon: "lotion" }, // 💡 화장품 추가
    { id: 14, name: "유아/이유식", icon: "baby-bottle-outline" }, // 💡 아기 용품
    { id: 15, name: "기타", icon: "dots-horizontal" }, // 💡 맨 마지막 기타
];

async function main() {
    console.log("🌱 데이터 시딩(Seeding)을 시작합니다...");

    for (const category of initialCategories) {
        // upsert: 데이터가 있으면 업데이트(update), 없으면 생성(create)
        const created = await prisma.category.upsert({
            where: { id: category.id },
            update: { isDefault: true, icon: category.icon, name: category.name }, // 이미 있으면 최신화
            create: {
                id: category.id,
                name: category.name,
                icon: category.icon,
                isDefault: true,
            },
        });
        console.log(`✅ 카테고리 세팅 완료: [${created.id}] ${created.name} (${created.icon})`);
    }

    console.log("🎉 시딩이 완료되었습니다!");
}

main()
    .then(async () => {
        // 작업이 끝나면 DB 연결을 안전하게 종료합니다.
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error("❌ 시딩 중 에러가 발생했습니다:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
