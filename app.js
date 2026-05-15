import express from "express";
import errorHandler from "./src/middleware/errorHandler.js";
import authRoutes from "./src/auth/auth.routes.js";
import userRoutes from "./src/user/user.routes.js";
import hotelRoutes from "./src/hotel/hotel.routes.js";
import roomRoutes from "./src/room/room.routes.js";
import bookingRoutes from "./src/booking/booking.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/booking", bookingRoutes);

app.use(errorHandler); //Siempre debe ir el último

export default app;
