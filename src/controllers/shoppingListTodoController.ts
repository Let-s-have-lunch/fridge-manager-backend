import { Request, Response } from "express"; // 🌟 AuthRequest 지우고 기본 Request로 바꿨습니다.
import shoppingListTodoService from "../services/shoppingListTodoService.ts";
import { ShoppingListInputType } from "../schemas/shoppingList/shoppingListTodoSchema.ts";

// 🌟 주 단위 조회(startDate, endDate) -> 날짜 하루(date) 조회로 완벽 수정!
const getItems = async (req: Request, res: Response) => {
    try {
        const { date } = req.query; // 👈 쿼리스트링으로 date 하나만 받음

        if (!date) {
            return res.status(400).json({
                message: "조회할 날짜(date)를 입력해주세요.",
            });
        }

        if (typeof date !== "string") {
            return res.status(400).json({
                message: "잘못된 날짜 형식입니다.",
            });
        }

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message: "유효하지 않은 날짜입니다.",
            });
        }

        // 🌟 치트키 발동: (req as any).user 로 타입 에러 강제 무시
        if (!(req as any).user) {
            return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
        }
        const userId = (req as any).user.id;

        // 👈 서비스 함수도 date 하나만 넘겨주도록 변경
        const itemList = await shoppingListTodoService.getItems(userId, parsedDate);

        res.status(200).json({
            message: "하루 단위 장보기 목록을 성공적으로 불러왔습니다.",
            data: itemList,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "장보기 목록 조회 중 서버 에러가 발생했습니다.",
        });
    }
};

const createItem = async (req: Request, res: Response) => {
    try {
        // 🌟 치트키 발동
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = user.id;
        const itemData: ShoppingListInputType = req.body;
        const newItem = await shoppingListTodoService.createItem(itemData, userId);
        res.status(201).json({
            message: "장보기 메모가 등록되었습니다.",
            data: newItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "장보기 메모 등록 중 서버 오류가 발생했습니다.",
        });
    }
};

// 🌟 서비스에서 throw new Error("NOT_FOUND_ITEM")를 던지도록 바꿨으니 에러 처리를 수정!
const updateItem = async (req: Request, res: Response) => {
    try {
        // 🌟 치트키 발동
        if (!(req as any).user) {
            return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
        }

        const itemId = Number(req.params.id);
        if (isNaN(itemId)) {
            res.status(400).json({ message: "유효하지 않은 ID 입니다." });
            return;
        }

        const userId = (req as any).user.id;
        const input: ShoppingListInputType = req.body;
        const result = await shoppingListTodoService.updateItem(userId, itemId, input);

        res.status(200).json({
            message: "장보기 메모가 성공적으로 수정되었습니다.",
            data: result,
        });
    } catch (error) {
        console.log(error);
        // 👈 deleteItem이나 toggleTodo처럼 NOT_FOUND_ITEM 에러를 잡아서 404 응답!
        if (error instanceof Error && error.message === "NOT_FOUND_ITEM") {
            return res.status(404).json({
                message: "장보기 메모를 찾을 수 없습니다.",
            });
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const deleteItem = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "유효하지 않은 ID입니다.",
            });
        }

        // 🌟 치트키 발동
        if (!(req as any).user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }

        const userId = (req as any).user.id;
        await shoppingListTodoService.deleteItem(id, userId);
        res.status(200).json({
            message: "장보기 메모가 성공적으로 삭제되었습니다.",
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "NOT_FOUND_ITEM") {
            return res.status(404).json({
                message: "장보기 메모를 찾을 수 없습니다.",
            });
        }
        res.status(500).json({
            message: "장보기 메모 삭제 중 오류가 발생했습니다.",
        });
    }
};

const toggleTodo = async (req: Request, res: Response) => {
    try {
        // 🌟 치트키 발동
        if (!(req as any).user) {
            return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
        }

        const itemId = Number(req.params.id);
        if (isNaN(itemId)) {
            return res.status(400).json({ message: "유효하지 않은 ID 입니다." });
        }

        const userId = (req as any).user.id;
        const result = await shoppingListTodoService.toggleTodo(userId, itemId);

        res.status(200).json({
            message: "완료 상태가 성공적으로 변경되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_ITEM") {
            res.status(404).json({ message: "존재하지 않는 항목입니다." });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getItems,
    createItem,
    updateItem,
    deleteItem,
    toggleTodo,
};
