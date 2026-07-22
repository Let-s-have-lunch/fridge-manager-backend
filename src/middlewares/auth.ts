import { NextFunction, Request, Response } from "express";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import jwt from "jsonwebtoken";
import { RoleType, User } from "../generated/prisma/client.ts";
import * as core from "express-serve-static-core";

export interface AuthRequest<
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query,
    Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다. (토큰 없음)" });
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "토큰이 비어있거나 형식이 올바르지 않습니다." });
            return;
        }

        const decoded = jwtUtil.verifyToken(token);

        const user = await userService.getUserById(decoded.id);

        if (!user || user.deletedAt) {
            res.status(401).json({ message: "유효하지 않은 사용자이거나 탈퇴한 계정입니다." });
            return;
        }

        req.user = user;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "토큰이 만료되었습니다. 다시 로그인해주세요." });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                message: "유효하지 않은 토큰 형식입니다. 다시 로그인해주세요.",
            });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "인증 처리 중 서버 에러가 발생되었습니다." });
    }
};

export const requiredAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ message: "인증 정보가 없습니다. 먼저 로그인 해주세요." });
        return;
    }
    if (req.user.role !== RoleType.ADMIN) {
        res.status(403).json({ message: "해당 기능에 접근 할 수 있는 관리자 권한이 없습니다." });
        return;
    }
    next();
};
