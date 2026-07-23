import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import statisticsService from "../services/statisticsService.ts";

const getUserStatistics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // 쿼리스트링에서 년/월 받기 (없으면 현재 날짜를 기준으로 이번 달 설정)
        const today = new Date();
        const year = Number(req.query.year) || today.getFullYear();
        const month = Number(req.query.month) || today.getMonth() + 1;

        const result = await statisticsService.getUserStatistics(userId, year, month);
        res.status(200).json({ message: "냉장고 통계 조회 성공", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

export default { getUserStatistics };
