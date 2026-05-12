import express from "express";
import errorHandler from "./src/middleware/errorHandler.js";
import authRoutes from "./src/auth/auth.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(errorHandler); //Siempre debe ir el último

export default app;
