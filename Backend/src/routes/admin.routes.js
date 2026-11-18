import express from "express";
import {
    createDoctor,
    createAdmin,
    deleteUser,
    getAdminStats,
    listUsers,
    setUserStatus,
    updateDoctor,
} from "../controller/admin.controller.js";
import { listAllAppointments, updateAppointmentStatus } from "../controller/appointment.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authenticateToken, authorizeRoles("admin"));
router.get("/users", listUsers);
router.get("/appointments", listAllAppointments);
router.get("/stats", getAdminStats);
router.post("/doctors", createDoctor);
router.patch("/doctors/:id", updateDoctor);
router.post("/admins", createAdmin);
router.patch("/users/:id/status", setUserStatus);
router.delete("/users/:id", deleteUser);
router.patch("/appointments/:id/status", updateAppointmentStatus);

export default router;
