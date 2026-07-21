import { Request, Response } from "express";
import { FridgeInputType } from "../schemas/fridgeSchema.ts";
import fridgeService from "../services/fridgeService.ts";

const getFridgeList = async (req: Request, res: Response) => {
    try {
        const list = await fridgeService.getFridgeList();
        res.status(200).json({
            message: "냉장고 목록을 성공적으로 불러왔습니다.",
            data: list,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "냉장고 목록 조회 중 서버 에러가 발생했습니다." });
    }
};

const createFridge = async (req: Request, res: Response) => {
    try {
        const { name }: FridgeInputType = req.body;

        const newFridge = await fridgeService.createFridge(name);
        res.status(201).json({
            message: "냉장고가 성공적으로 등록되었습니다.",
            data: newFridge,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXISTS_NAME") {
                res.status(409).json({
                    message:
                        "이미 사용 중인 냉장고 이름입니다. 삭제된 냉장고가 아니라면 다른 이름을 사용해주세요.",
                });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "냉장고 등록 중 서버 에러가 발생했습니다." });
    }
};

const updateFridge = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 냉장고 ID 입니다." });
            return;
        }

        const { name }: FridgeInputType = req.body;

        const updatedFridge = await fridgeService.updateFridge(id, name);

        res.status(200).json({
            message: "냉장고 정보가 성공적으로 수정되었습니다.",
            data: updatedFridge,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_FRIDGE") {
                res.status(404).json({ message: "존재하지 않거나 이미 삭제된 냉장고입니다." });
                return;
            }
            if (error.message === "ALREADY_EXISTS_NAME") {
                res.status(409).json({ message: "변경하시려는 이름이 이미 존재합니다." });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "냉장고 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteFridge = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 냉장고 ID 입니다." });
            return;
        }

        await fridgeService.deleteFridge(id);

        res.status(200).json({
            message: "냉장고가 성공적으로 삭제되었습니다.",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_FRIDGE") {
                res.status(404).json({ message: "존재하지 않거나 이미 삭제된 냉장고입니다." });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "냉장고 삭제 중 서버 에러가 발생했습니다." });
    }
};

export default { getFridgeList, createFridge, updateFridge, deleteFridge };
