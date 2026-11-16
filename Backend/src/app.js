import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "https://frontend-hafsa.vercel.app",
    credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
    return res.status(404).json({ message: `API route ${req.method} ${req.path} was not found.` });
});

app.use((error, req, res, next) => {
    console.error(error);
    if (error.code === 11000) {
        return res.status(409).json({ message: "An account with this email already exists." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Something went wrong. Please try again." });
});

export default app;
