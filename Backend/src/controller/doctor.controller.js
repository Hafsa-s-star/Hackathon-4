import mongoose from "mongoose";
import usersModel from "../models/users.model.js";

export async function listDoctors(req, res, next) {
    try {
        const search = req.query.search?.trim();
        const specialization = req.query.specialization?.trim();
        const filter = { role: "doctor", isActive: true };
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { name: { $regex: escaped, $options: "i" } },
                { specialization: { $regex: escaped, $options: "i" } },
            ];
        }
        if (specialization) {
            const escaped = specialization.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.specialization = { $regex: `^${escaped}$`, $options: "i" };
        }
        const [doctors, specializations] = await Promise.all([
            usersModel.find(filter)
                .select("name specialization experience phone")
                .sort({ name: 1 }),
            usersModel.distinct("specialization", {
                role: "doctor",
                isActive: true,
                specialization: { $type: "string", $ne: "" },
            }),
        ]);
        return res.json({
            doctors,
            specializations: specializations.sort((a, b) => a.localeCompare(b)),
        });
    } catch (error) {
        return next(error);
    }
}

export async function getDoctor(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid doctor ID." });
        }
        const doctor = await usersModel.findOne({
            _id: req.params.id,
            role: "doctor",
            isActive: true,
        }).select("name specialization experience phone");
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }
        return res.json({ doctor });
    } catch (error) {
        return next(error);
    }
}
