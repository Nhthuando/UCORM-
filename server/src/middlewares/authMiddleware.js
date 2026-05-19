import jwt from "jsonwebtoken"

export const authMiddleware = (req,res,next) => {
    try {
        const bearerToken = req.header("authorization");
        if(!bearerToken) return res.status(401).json({message: "Không tìm thấy token!"});
        if(!bearerToken.startsWith("Bearer ")) return res.status(401).json({message: "Token không hợp lệ!"});
        const token = bearerToken.split(" ")[1];
        if(!token) return res.status(401).json({message: "Không tìm thấy token!"});
        const jwtsecret = process.env.JWT_SECRET;
        if(!jwtsecret) return res.status(500).json({message: "Không tìm thấy JWT_SECRET!"});
        const decode = jwt.verify(token,jwtsecret);
        const {userId, userName, userEmail} = decode;
        req.user = {userId, userName, userEmail};
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Token hết hạn hoặc có lỗi token!"});
    }
}