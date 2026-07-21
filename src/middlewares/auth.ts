import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 1. Request 타입 확장: req.user에 유저 정보를 담기 위함
export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}

// 2. 인증 미들웨어 함수
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        // 헤더에서 토큰 추출 (형식: "Bearer [토큰값]")
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "인증 토큰이 없습니다. 로그인이 필요합니다." });
            return;
        }

        const token = authHeader.split(" ")[1];

        // 환경변수에서 시크릿 키 가져오기 (없으면 에러 방지용 기본값)
        const secretKey = process.env.JWT_SECRET || "your-secret-key";

        // 토큰 검증 및 해독
        const decoded = jwt.verify(token, secretKey);

        // 검증된 유저 정보를 req.user에 저장 (이후 컨트롤러에서 사용 가능)
        req.user = decoded;

        next(); // 다음 미들웨어나 컨트롤러로 이동
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "토큰이 만료되었습니다. 다시 로그인해주세요." });
            return;
        }
        res.status(401).json({ message: "유효하지 않은 토큰입니다." });
        return;
    }
};
