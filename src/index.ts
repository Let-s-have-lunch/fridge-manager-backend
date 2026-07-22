import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fridgeRouter from "./routes/fridgeRouter.ts";
import productRouter from "./routes/productRouter.ts";
import categoryRouter from "./routes/categoryRouter.ts";
import userRouter from "./routes/userRouter.ts";
import noticeRouter from "./routes/noticeRouter.ts";

dotenv.config();

const app = express();

const PORT = process.env.PORT || "8080";

app.use(
    cors({
        origin: ["http://localhost:8081", "http://localhost:8082", "http://localhost:8083"],
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/fridges", fridgeRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/users", userRouter);
app.use("/notice", noticeRouter);

app.listen(PORT, () => {
    console.log(`서버 실행됨! http://localhost:${PORT}`);
});
