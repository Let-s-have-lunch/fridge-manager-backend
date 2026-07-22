import { AuthRequest } from "../middlewares/auth.ts";
import {Request, Response} from "express";
import { UserCreateInput } from "../generated/prisma/models/User.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";
import { UpdatePasswordInputType } from "../schemas/user/updatePasswordSchema.ts";
import { WithdrawUserInputType } from "../schemas/user/withdrawUser.ts";
import userService from "../services/userService.ts";

const getMe = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "유효하지 않은 사용자이거나 탈퇴한 계정입니다." });
        return;
    }

    res.status(200).json({
        message: "사용자 정보 확인이 완료되었습니다.",
        data: req.user,
    });
};

const createUser = async (req: Request, res: Response) => {
    try {
        const { nickname, password, email, birthdate } =
            req.body;

        const userData: UserCreateInput = {
            password: await passwordUtil.hashPassword(password),
            nickname,
            email,
            birthdate: birthdate ? new Date(birthdate) : null,
        };

        const newUser = await userService.createUser(userData);
        res.status(201).json({ message: "성공적으로 회원가입 되었습니다.", data: newUser });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "ALREADY_EXISTS_EMAIL":
                    res.status(409).json({ message: "이미 가입된 이메일입니다." });
                    return;
                case "ALREADY_EXISTS_NICKNAME":
                    res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
                    return;
                default:
                    console.log(error);
                    res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
                    return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const loginData: LoginInputType = req.body;

        const result = await userService.login(loginData);

        res.status(200).json({
            message: "로그인에 성공했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_CREDENTIALS") {
                res.status(400).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
                return;
            }
        }

        console.log(error);
        res.status(500).json({ message: "로그인 처리 중 서버 에러가 발생했습니다." });
    }
};

const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "인증되지 않은 사용자입니다." });
            return;
        }

        const userId = req.user.id;

        const input: UpdateUserInputType = req.body;

        const result = await userService.updateUser(userId, input);
        res.status(200).json({
            message: "회원 정보가 성공적으로 수정되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                res.status(404).json({ message: "해당 사용자를 찾을 수 없습니다." });
                return;
            } else if (error.message === "DUPLICATED_NICKNAME") {
                res.status(409).json({
                    message: "이미 존재하는 닉네임입니다.",
                });
                return;
            }
        }

        console.log(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "인증되지 않은 사용자입니다." });
            return;
        }

        const userId = req.user.id;

        const { prevPassword, password }: UpdatePasswordInputType = req.body;

        await userService.updatePassword(userId, prevPassword, password);
        res.status(200).json({
            message: "비밀번호가 성공적으로 변경되었습니다.",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                res.status(404).json({
                    message: "해당 사용자를 찾을 수 없습니다.",
                });
                return;
            } else if (error.message === "INVALID_PASSWORD") {
                res.status(400).json({
                    message: "현재 비밀번호가 일치하지 않습니다.",
                });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const withdrawUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "인증되지 않은 사용자입니다." });
            return;
        }

        const userId = req.user.id;

        const { password }: WithdrawUserInputType = req.body;

        await userService.withdrawUser(userId, password);
        res.status(200).json({
            message: "회원 탈퇴가 성공적으로 처리되었습니다.",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                res.status(404).json({
                    message: "해당 사용자를 찾을 수 없습니다.",
                });
                return;
            } else if (error.message === "INVALID_PASSWORD") {
                res.status(400).json({
                    message: "현재 비밀번호가 일치하지 않습니다.",
                });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "회원 탈퇴 중 서버 에러가 발생했습니다." });
    }
};



export default { getMe, createUser, login, updateUser, updatePassword, withdrawUser };
