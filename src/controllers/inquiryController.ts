import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import { InquiryInputType } from "../schemas/inquiry/inquirySchema.ts";
import inquiryService from "../services/inquiryService.ts";

const getInquiryList = async (req: AuthRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 20;

        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const userId = req.user.id;

        const result = await inquiryService.getInquiryList(page, size, userId);
        res.status(200).json({ message: "문의 목록 조회 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "문의 목록 조회 중 서버 오류가 발생되었습니다." });
    }
};

const getInquiryById = async (req: AuthRequest<{ inquiryId: string }>, res: Response) => {
    try {
        const inquiryId = Number(req.params.inquiryId);
        if (isNaN(inquiryId)) {
            res.status(400).json({ message: "잘못된 문의 ID 입니다." });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const userId = req.user.id;

        const result = await inquiryService.getInquiryById(inquiryId);
        if (result.userId !== userId) {
            res.status(403).json({ message: " 해당 문의글을 읽을 권한이 없습니다." });
            return;
        }

        res.status(200).json({ message: "문의 조회 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "문의글 조회 중 서버 오류가 발생되었습니다." });
    }
};

const createInquiry = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content }: InquiryInputType = req.body;

        if (!req.user) {
            res.status(401).json({ message: "문의글 수정에 대한 권한이 없습니다." });
            return;
        }
        const userId = req.user.id;

        const result = await inquiryService.createInquiry(title, content, userId);
        res.status(201).json({
            message: "문의글 등록 성공",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "문의글 등록 중 서버 오류가 발생되었습니다.",
        });
    }
};

const updateInquiry = async (req: AuthRequest<{ inquiryId: string }>, res: Response) => {
    try {
        const inquiryId = Number(req.params.inquiryId);
        if (isNaN(inquiryId)) {
            res.status(400).json({ message: "문의글 ID가 유효하지 않습니다." });
            return;
        }

        const { title, content }: InquiryInputType = req.body;

        if (!req.user) {
            res.status(401).json({ message: "문의글 수정에 대한 권한이 없습니다." });
            return;
        }
        const userId = req.user.id;

        const result = await inquiryService.updateInquiry(inquiryId, title, content, userId);
        res.status(200).json({ message: "문의글 수정 성공", data: result });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_INQUIRY") {
                res.status(404).json({ message: "문의글을 찾을 수 없습니다." });
                return;
            } else if (error.message === "NOT_YOUR_INQUIRY") {
                res.status(403).json({ message: "문의글 수정에 대한 권한이 없습니다." });
                return;
            } else if (error.message === "ALREADY_ANSWERED") {
                res.status(403).json({ message: "이미 답변이 달린 문의글은 수정할 수 없습니다." });
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "문의글 수정 중 서버 오류가 발생되었습니다.",
        });
    }
};

const deleteInquiry = async (req: AuthRequest<{ inquiryId: string }>, res: Response) => {
    try {
        const inquiryId = Number(req.params.inquiryId);
        if (isNaN(inquiryId)) {
            res.status(400).json({ message: "문의글 ID가 유효하지 않습니다." });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "문의글 삭제에 대한 권한이 없습니다." });
            return;
        }
        const userId = req.user.id;

        const inquiry = await inquiryService.getInquiryById(inquiryId);

        if (!inquiry) {
            res.status(404).json({
                message: "문의글을 찾을 수 없습니다.",
            });
            return;
        }

        if (inquiry.userId !== userId) {
            res.status(403).json({
                message: "삭제 권한이 없습니다.",
            });
            return;
        }

        if (inquiry.answer) {
            res.status(403).json({
                message: "답변이 존재하는 문의글은 삭제할 수 없습니다.",
            });
        }

        await inquiryService.deleteInquiry(inquiryId);
        res.status(200).json({ message: "문의글 삭제가 성공했습니다." });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "문의글 삭제 중 서버 오류가 발생되었습니다.",
        });
    }
};

export default { getInquiryList, getInquiryById, createInquiry, updateInquiry, deleteInquiry };
