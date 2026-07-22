import prisma from "../config/prisma.ts";

const getNoticeList = async (page: number, size: number) => {
    const total = await prisma.notice.count();

    const list = await prisma.notice.findMany({
        orderBy: {
            id: "desc",
        },
        skip: (page - 1) * size,
        take: size,
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const getNoticeById = async (id: number) => {
    const notice = await prisma.notice.findUnique({
        where: {
            id,
        },
    });

    if (!notice) {
        throw new Error("NOT_FOUND_NOTICE");
    }
    return notice;
};

export default { getNoticeById, getNoticeList };

