import { Request, Response } from "express";
import noticeService from "../services/noticeService.ts";

const getNoticeList = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 10;

        const result = await noticeService.getNoticeList(page, size);
        res.status(200).json({ message: "공지사항 목록을 불러오는데 성공했습니다", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "공지사항 목록 조회 중 서버 에러가 발생되었습니다.",
        });
    }
};

const getNoticeById = async (req: Request<{ noticeId: string }>, res: Response) => {
    try {
        const id = Number(req.params.noticeId);
        if (isNaN(id))
            return res.status(400).json({ message: "유효하지 않은 공지사항 ID 입니다." });

        const result = await noticeService.getNoticeById(id);
        res.status(200).json({ message: "공지사항 조회 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "공지사항 조회 중 서버 에러가 발생되었습니다.",
        });
    }
};

export default { getNoticeList, getNoticeById };
