import { Request, Response } from "express";
import adminDashboardService from "../../services/admin/adminDashboardService.ts";

const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const result = await adminDashboardService.getDashboardSummary();

        res.status(200).json({
            message: "관리자 대시보드 정보를 성공적으로 조회했습니다.",
            data: result,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "관리자 대시보드 조회 중 서버 에러가 발생했습니다.",
        });
    }
};

export default {
    getDashboardSummary,
};
