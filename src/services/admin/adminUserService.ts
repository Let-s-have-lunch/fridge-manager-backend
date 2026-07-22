import prisma from "../../config/prisma.ts";
import {  UserUpdateInput } from "../../generated/prisma/models/User.ts";
import { Prisma } from "../../generated/prisma/client.ts";

const getUserList = async (page: number, size: number) => {
    const skip = (page - 1) * size;
    const take = size;

    const total = await prisma.user.count({
        where: {
            deletedAt: null,
        },
    });


    const list = await prisma.user.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            id: "desc",
        },
        take,
        skip,
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
            deletedAt: null,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
};

const updateUser = async (input: UserUpdateInput, id: number) => {
    const user = await prisma.user.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    try {
        return await prisma.user.update({
            where: {
                id,
            },
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const errorMessage = error.message;

                if (errorMessage.includes("email")) {
                    throw new Error("ALREADY_EXISTS_EMAIL");
                }
                if (errorMessage.includes("nickname")) {
                    throw new Error("ALREADY_EXISTS_NICKNAME");
                }
            }
        }

        throw new Error("UNKNOWN_ERROR");
    }
};

const deleteUser = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    if (user.deletedAt) {
        throw new Error("USER_ALREADY_DELETED");
    }

    return prisma.user.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};

export default { getUserList, getUserById, updateUser, deleteUser };
