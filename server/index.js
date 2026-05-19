import express from "express";
import authRouter from "./src/routes/authenRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", authRouter);

app.listen(PORT,  () => {
    console.log("-----------------------------------------------");
    console.log("UCORM server đang được chạy dưới port: " + PORT);
    console.log("-----------------------------------------------");
})

