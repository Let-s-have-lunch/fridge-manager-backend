import prisma from "../src/config/prisma.ts";

// 기본 9개의 카테고리를 씨드작업 하고 시작합니다.
// 아래에 생성한 9개의 카테고리는 isDefault = true로 생성되고
// 사용자가 직접 추가한 카테고리는 isDefault = false(기본값)로 들어갑니다.

// 프론트엔드 쪽에서는 카테고리 목록을 받아와서 사용하는데
// filter 메소드를 이용해서 isDefault가 true인 배열과, false인 배열을 각각 다른 변수에 담아서
// isDefault가 true인 배열을 먼저 아이콘과 함께 뿌려주고
// 그 아래에 사용자가 직접 등록한 isDefault가 false인 카테고리를 뿌려줍니다.


const initialCategories = [
    { id: 1, name: "채소류" },
    { id: 2, name: "과일류" },
    { id: 3, name: "육류/해산물" },
    { id: 4, name: "유제품" },
    { id: 5, name: "가공식품" },
    { id: 6, name: "양념/소스류" },
    { id: 7, name: "반찬류/조리된 음식" },
    { id: 8, name: "음료" },
    { id: 9, name: "기타" },
];

async function main() {
    console.log("🌱 데이터 시딩(Seeding)을 시작합니다...");

    for (const category of initialCategories) {
        // upsert: 데이터가 있으면 업데이트(update), 없으면 생성(create)
        const created = await prisma.category.upsert({
            where: { id: category.id },
            update: { isDefault: true }, // 이미 있으면 isDefault만 true로 덮어씌움
            create: {
                id: category.id,
                name: category.name,
                isDefault: true,
            },
        });
        console.log(`✅ 카테고리 세팅 완료: [${created.id}] ${created.name}`);
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
