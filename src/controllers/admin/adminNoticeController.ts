import { Request, Response } from "express";
import { NoticeInputType } from "../../schemas/admin/notice/noticeSchema.ts";
import noticeService from "../../services/noticeService.ts";


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
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_NOTICE") {
                res.status(404).json({
                    message: "존재하지 않는 공지사항입니다.",
                });
                return;
            }
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
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_NOTICE") {
                res.status(404).json({
                    message: "존재하지 않는 공지사항입니다.",
                });
                return;
            }
        }
        res.status(500).json({
            message: "공지사항 삭제 중 서버 에러가 발생되었습니다.",
        });
    }
};

export default { createNotice, updateNotice, deleteNotice };
