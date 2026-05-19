import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT,  () => {
    console.log("-----------------------------------------------");
    console.log("UCORM server đang được chạy dưới port: " + PORT);
    console.log("-----------------------------------------------");
})