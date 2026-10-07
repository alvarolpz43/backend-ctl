import jwt from "jsonwebtoken";
import UserModel from "../Auth/models/user.model.js";

export const validateToken = (token) => {
  try {
    const secret = process.env.SECRET_KEY;
    if (!secret) {
      throw new Error("No hay secreto en .env");
    }
    const decodedToken = jwt.verify(token, secret);
    return decodedToken;
  } catch (error) {
    return false;
  }
};

export const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization?.split(' ')[1];

    if (!authorization) {
      res.status(401).json({ success: false, error: "Token no proporcionado" });
      return;
    }

    const validation = validateToken(authorization);

    if (!validation) {
      res.status(401).json({ success: false, message: "Access Denied" });
      return;
    }

    const user = await UserModel.findById(validation.userId)
      .select("-password")
      .populate("role");

    if (!user) {
      res.status(401).json({ success: false, message: "Usuario no existe" });
      return;
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permisos: user.role?.permisos || {},
    };

    return next();
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    res.status(500).json({
      success: false,
      error: "Error interno en el middleware de autenticación",
    });
  }
};




