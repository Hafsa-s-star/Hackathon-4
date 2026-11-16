import express from "express";
import { getDoctor, listDoctors } from "../controller/doctor.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authenticateToken);
router.get("/", listDoctors);
router.get("/:id", getDoctor);

export default router;
