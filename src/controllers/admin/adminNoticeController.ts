import { Request, Response } from "express";
import { NoticeInputType } from "../../schemas/admin/notice/noticeSchema.ts";
import noticeService from "../../services/noticeService.ts";

// ✅ 공지사항 목록 조회 컨트롤러 추가
const getNoticeList = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 15;

        const result = await noticeService.getNoticeList(page, size);
        res.status(200).json({
            message: "공지사항 목록 조회 성공",
            data: result, // { list, total, page, size } 구조 반환 예상
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "공지사항 목록 조회 중 서버 에러가 발생되었습니다." });
    }
};

// ✅ 공지사항 상세 조회 컨트롤러 추가
const getNoticeById = async (req: Request<{ noticeId: string }>, res: Response) => {
    try {
        const id = Number(req.params.noticeId);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 공지사항 ID입니다." });
            return;
        }

        const result = await noticeService.getNoticeById(id);
        res.status(200).json({
            message: "공지사항 상세 조회 성공",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_NOTICE") {
            res.status(404).json({ message: "존재하지 않는 공지사항입니다." });
            return;
        }
        res.status(500).json({ message: "공지사항 상세 조회 중 서버 에러가 발생되었습니다." });
    }
};

const createNotice = async (req: Request, res: Response) => {
    try {
        const { title, content }: NoticeInputType = req.body;
        const result = await noticeService.createNotice(title, content);
        res.status(201).json({
            message: "공지사항이 정상적으로 등록되었습니다.",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "공지사항 등록 중 서버 에러가 발생되었습니다." });
    }
};

const updateNotice = async (req: Request<{ noticeId: string }>, res: Response) => {
    try {
        const id = Number(req.params.noticeId);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 공지사항 ID입니다.",
            });
            return;
        }

        const { title, content }: NoticeInputType = req.body;
        const result = await noticeService.updateNotice(id, title, content);
        res.status(200).json({
            message: "공지사항이 수정되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_NOTICE") {
            res.status(404).json({
                message: "존재하지 않는 공지사항입니다.",
            });
            return;
        }
        res.status(500).json({
            message: "공지사항 수정 중 서버 에러가 발생되었습니다.",
        });
    }
};

const deleteNotice = async (req: Request<{ noticeId: string }>, res: Response) => {
    try {
        const id = Number(req.params.noticeId);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 공지사항 ID 입니다.",
            });
            return;
        }

        await noticeService.deleteNotice(id);
        res.status(200).json({ message: "공지사항이 삭제되었습니다." });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_NOTICE") {
            res.status(404).json({
                message: "존재하지 않는 공지사항입니다.",
            });
            return;
        }
        res.status(500).json({
            message: "공지사항 삭제 중 서버 에러가 발생되었습니다.",
        });
    }
};

export default {
    getNoticeList,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice,
};
