import prisma from "../../config/prisma.ts";

const getDashboardSummary = async () => {
    const recentUsers = await prisma.user.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        select: {
            id: true,
            nickname: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    return {
        recentUsers,
    };
};


export default {
    getDashboardSummary,
};
