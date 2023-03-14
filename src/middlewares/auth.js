import jwt from "jsonwebtoken";

class authMiddleware {
  async checkJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = await jwt.verify(token, process.env.HASH_SECRET);
      req.userId = decoded.id;

      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid Token" });
    }
  }
}

export default new authMiddleware();
