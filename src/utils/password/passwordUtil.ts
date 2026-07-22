import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const hashPassword = async (password: string) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

const verifyPassword = async (plainPassword: string, hashedPassword: string) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

export default {
    hashPassword,
    verifyPassword,
};
