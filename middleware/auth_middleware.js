import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED TOKEN:", decoded); // 🔥 VERY IMPORTANT

    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};