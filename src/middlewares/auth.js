import jwt from "jsonwebtoken";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token can't be read" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await jwt.verify(token, process.env.HASH_SECRET);
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};
