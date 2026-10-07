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
    // Si la solicitud ya fue autenticada previamente en este ciclo de request, continuar
    if (req.user) {
      return next();
    }

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado: Token no proporcionado",
        error: "Se requiere encabezado Authorization con Bearer Token",
      });
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado: Formato de token inválido",
        error: "El formato de autorización debe ser 'Bearer <token>'",
      });
    }

    const token = parts[1];
    const validation = validateToken(token);

    if (!validation || !validation.userId) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado: Token inválido o expirado",
        error: "Token no válido o expirado",
      });
    }

    const user = await UserModel.findById(validation.userId)
      .select("-password")
      .populate("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado: Usuario no existe o no encontrado",
        error: "Usuario no existe",
      });
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
    return res.status(500).json({
      success: false,
      message: "Error interno en el middleware de autenticación",
      error: error.message,
    });
  }
};




