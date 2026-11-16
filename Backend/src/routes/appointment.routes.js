import express from "express";
import {
    cancelAppointment,
    createAppointment,
    listDoctorAppointments,
    listPatientAppointments,
    updateAppointmentStatus,
} from "../controller/appointment.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.post("/", authorizeRoles("patient"), createAppointment);
router.get("/my", authorizeRoles("patient"), listPatientAppointments);
router.patch("/:id/cancel", authorizeRoles("patient"), cancelAppointment);
router.get("/doctor", authorizeRoles("doctor"), listDoctorAppointments);
router.patch("/:id/status", authorizeRoles("doctor"), updateAppointmentStatus);

export default router;
