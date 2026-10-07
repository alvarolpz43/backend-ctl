import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";

import CTLroutes from "./CTL/indexRoutes.js";
import AuthRoutes from "./Auth/index.js";
import { authMiddleware } from "./Middleware/ValidateAuth.js";
import { login } from "./Auth/controllers/user.controller.js";
import { validateSchema } from "./Middleware/ValidatorSchema.js";
import { loginSchema } from "./Auth/schema/user.schema.js";

config();

const app = express();
app.use(express.json());

app.use(morgan("dev"));
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://ctlapp.vercel.app",
    "https://front-end-ctl.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: false,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    })
);

// Alias directo para POST /login
app.post("/login", validateSchema(loginSchema), login);

// Middleware global: exige Bearer Token en todos los endpoints, excepto /login
app.use((req, res, next) => {
    // Permitir preflight CORS sin requerir token
    if (req.method === "OPTIONS") {
        return next();
    }

    // Excluir endpoints de inicio de sesión (/login, /auth/login, /auth/users/login)
    const cleanPath = (req.originalUrl || req.path).split("?")[0].toLowerCase().replace(/\/+$/, "");
    if (cleanPath === "/login" || cleanPath.endsWith("/login")) {
        return next();
    }

    return authMiddleware(req, res, next);
});

app.use("/ctl", CTLroutes);
app.use("/auth", AuthRoutes);

app.set("port", process.env.PORT || 3000);

app.use("*", (req, res, next) => {
    res.status(404).json({
        message: "CTL EndPoint Not Found",
    });
});

export default app;
