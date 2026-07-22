import prisma from "../config/prisma.ts";
import { UserCreateInput } from "../generated/prisma/models/User.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";


const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    return user;
};

const createUser = async (data: UserCreateInput) => {
    try {
        return await prisma.user.create({
            data,
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
                throw new Error("UNKNOWN_ERROR");
            }
        }

        throw new Error("UNKNOWN_ERROR");
    }
};

const login = async (data: LoginInputType) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user || user.deletedAt) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isValid = await passwordUtil.verifyPassword(data.password, user.password);
    if (!isValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwtUtil.generateToken(user.id);

    const { password, deletedAt, ...safeUserInfo } = user;

    return {
        user: safeUserInfo,
        token,
    };
};

const updateUser = async (userId: number, input: UpdateUserInputType) => {
    const existUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!existUser || existUser.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }

    if (input.nickname) {
        const existNickname = await prisma.user.findFirst({
            where: {
                nickname: input.nickname,
                deletedAt: null,
                id: {
                    not: userId,
                },
            },
        });

        if (existNickname) {
            throw new Error("DUPLICATED_NICKNAME");
        }
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            nickname: input.nickname,
            birthdate: input.birthdate ?? null,
        },
    });
};

const updatePassword = async (userId: number, prevPw: string, pw: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const isPasswordValid = await passwordUtil.verifyPassword(prevPw, user.password);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }

    const hashedPassword = await passwordUtil.hashPassword(pw);

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashedPassword,
        },
    });
};

const withdrawUser = async (userId: number, password: string) => {
    const existUser = await prisma.user.findFirst({
        where: {
            id: userId,
            deletedAt: null,
        },
    });

    if (!existUser) {
        throw new Error("USER_NOT_FOUND");
    }

    const isPasswordValid = await passwordUtil.verifyPassword(password, existUser.password);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};




export default { createUser, login, updateUser, updatePassword, withdrawUser, getUserById };
