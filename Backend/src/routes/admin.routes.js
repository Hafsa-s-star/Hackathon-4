import express from "express";
import {
    createDoctor,
    createAdmin,
    deleteUser,
    getAdminStats,
    listUsers,
    setUserStatus,
} from "../controller/admin.controller.js";
import { listAllAppointments } from "../controller/appointment.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authenticateToken, authorizeRoles("admin"));
router.get("/users", listUsers);
router.get("/appointments", listAllAppointments);
router.get("/stats", getAdminStats);
router.post("/doctors", createDoctor);
router.post("/admins", createAdmin);
router.patch("/users/:id/status", setUserStatus);
router.delete("/users/:id", deleteUser);

export default router;
