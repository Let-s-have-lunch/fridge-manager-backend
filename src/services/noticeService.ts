import prisma from "../config/prisma.ts";

const createNotice = async (title: string, content: string) => {
    return prisma.notice.create({
        data: {
            title,
            content,
        },
    });
};

const updateNotice = async (id: number, title: string, content: string) => {
    await getNoticeById(id);

    return prisma.notice.update({
        where: {
            id,
        },
        data: {
            title,
            content,
        },
    });
};

const deleteNotice = async (id: number) => {
    await getNoticeById(id);

    return prisma.notice.delete({
        where: {
            id,
        },
    });
};

export default { createNotice, updateNotice, deleteNotice };