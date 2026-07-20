import prisma from "../config/prisma.ts";

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

export default { getUserById };
