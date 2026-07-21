import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fridgeRouter from "./routes/fridgeRouter.ts";

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

app.use("/fridge", fridgeRouter);

app.listen(PORT, () => {
    console.log(`서버 실행됨! http://localhost:${PORT}`);
});
