import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    id: number;
}

const getSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.");
    }
    return secret;
};

const generateToken = (userId: number) => {
    return jwt.sign({ id: userId }, getSecretKey(), {
        expiresIn: "1d",
    });
};

const verifyToken = (token: string) => {
    return jwt.verify(token, getSecretKey()) as DecodedToken;
};

export default {
    generateToken,
    verifyToken,
};