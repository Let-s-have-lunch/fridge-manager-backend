import { Request, Response } from "express";
import { UserUpdateInput } from "../../generated/prisma/models/User.ts";
import passwordUtil from "../../utils/password/passwordUtil.ts";
import { AdminUpdateUserInputType } from "../../schemas/admin/user/updateUser.ts";
import adminUserService from "../../services/admin/adminUserService.ts";

const getUserList = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 20;

        const result = await adminUserService.getUserList(page, size);
        res.status(200).json({ message: "유저 목록을 성공적으로 불러왔습니다.", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "유저 목록을 불러오는 중 오류가 발생했습니다." });
    }
};

const getUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
            return;
        }

        const user = await adminUserService.getUserById(id);

        res.status(200).json({ message: "유저 정보를 성공적으로 불러왔습니다.", data: user });
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            res.status(404).json({ message: "존재하지 않는 유저입니다." });
            return;
        }

        console.log(error);
        res.status(500).json({ message: "서버에 에러가 발생했습니다." });
    }
};


const updateUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
            return;
        }

        const { password, birthdate, ...restData }: AdminUpdateUserInputType = req.body;

        const newUser: UserUpdateInput = {
            ...restData,
        };

        if (password) {
            newUser.password = await passwordUtil.hashPassword(password);
        }

        if (birthdate) {
            newUser.birthdate = new Date(birthdate);
        }

        const result = await adminUserService.updateUser(newUser, id);

        res.status(200).json({
            message: "유저를 성공적으로 변경했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "USER_NOT_FOUND":
                    res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
                    return;
                case "ALREADY_EXISTS_EMAIL":
                    res.status(409).json({ message: "이미 사용 중인 이메일입니다.." });
                    return;
                case "ALREADY_EXISTS_NICKNAME":
                    res.status(409).json({ message: "이미 사용 중인 닉네임입니다.." });
                    return;
            }
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const deleteUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
            return;
        }

        const deletedUser = await adminUserService.deleteUser(id);
        res.status(200).json({ message: "유저가 성공적으로 삭제되었습니다.", data: deletedUser });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                res.status(404).json({ message: "유저를 찾을 수 없습니다." });
                return;
            }
            if (error.message === "USER_ALREADY_DELETED") {
                res.status(400).json({ message: "이미 삭제된 유저입니다." });
                return;
            }
            console.log(error);
            res.status(500).json({ message: "서버 에러가 발생했습니다." });
        }
    }
};

export default {
    getUserList,
    getUserById,
    updateUser,
    deleteUser,
};
