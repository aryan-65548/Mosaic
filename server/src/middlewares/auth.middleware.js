import jwt from "jsonwebtoken";
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try{
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user= {id: payload.sub, role: payload.role};
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
    
}
