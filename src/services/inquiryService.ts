import prisma from "../config/prisma.ts";

const getInquiryList = async (page: number, size: number, userId?: number) => {
    const skip = (page - 1) * size;

    const whereCondition = userId ? { userId } : {};
    const total = await prisma.inquiry.count({
        where: whereCondition,
    });

    const list = await prisma.inquiry.findMany({
        orderBy: {
            id: "desc",
        },
        where: whereCondition,
        skip,
        take: size,
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const getInquiryById = async (id: number) => {
    const inquiry = await prisma.inquiry.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
    });

    if (!inquiry) {
        throw new Error("NOT_FOUND_INQUIRY");
    }

    return inquiry;
};

const createInquiry = async (title: string, content: string, userId: number) => {
    return prisma.inquiry.create({
        data: {
            title,
            content,
            userId,
        },
    });
};

const answerInquiry = async (id: number, answer?: string) => {
    await getInquiryById(id);

    return prisma.inquiry.update({
        where: {
            id,
        },
        data: {
            answer: answer ? answer : null,
            answeredAt: answer ? new Date() : null,
        },
    });
};

const updateInquiry = async (inquiryId: number, title: string, content: string, userId: number) => {
    const inquiry = await getInquiryById(inquiryId);

    if (inquiry.userId !== userId) {
        throw new Error("NOT_YOUR_INQUIRY");
    }

    if (inquiry.answer) {
        throw new Error("ALREADY_ANSWER");
    }

    return prisma.inquiry.update({
        where: {
            id: inquiryId,
        },
        data: {
            title,
            content,
        },
    });
};

const deleteInquiry = async (inquiryId: number) => {
    return prisma.inquiry.delete({
        where: {
            id: inquiryId,
        },
    });
};

export default {
    getInquiryList,
    getInquiryById,
    createInquiry,
    answerInquiry,
    updateInquiry,
    deleteInquiry,
};
