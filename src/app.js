import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";

import CTLroutes from "./CTL/indexRoutes.js";
import AuthRoutes from "./Auth/index.js";



config();

const app = express();
app.use(express.json());

app.use(morgan("dev"));
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://ctl-frontend.vercel.app"
]

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        }, credentials: false,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE"]
    })
)

app.use("/ctl", CTLroutes);
app.use("/auth", AuthRoutes);

app.set("port", process.env.PORT || 3000);

app.use("*", (req, res, next) => {
    res.status(404).json({
        message: "CTL EndPoint Not Found",
    });
});

export default app;
