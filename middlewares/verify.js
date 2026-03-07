import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json("No token");

  const token = authHeader.split(" ")[1];

  jwt.verify(token, "19200525", (err, user) => {

    if (err)
      return res.status(403).json("Invalid token");

    req.user = user;

    next();
  });
};