import bcrypt from "bcrypt";
import mongoose from "mongoose";
import appointmentsModel from "../models/appointments.model.js";
import usersModel from "../models/users.model.js";

export async function listUsers(req, res, next) {
    try {
        const users = await usersModel.find()
            .select("name email role phone specialization experience isActive createdAt")
            .sort({ createdAt: -1 });
        return res.json({ users });
    } catch (error) {
        return next(error);
    }
}

export async function getAdminStats(req, res, next) {
    try {
        const [patients, doctors, appointments] = await Promise.all([
            usersModel.countDocuments({ role: "patient" }),
            usersModel.countDocuments({ role: "doctor" }),
            appointmentsModel.countDocuments(),
        ]);
        return res.json({ stats: { patients, doctors, appointments } });
    } catch (error) {
        return next(error);
    }
}

export async function createDoctor(req, res, next) {
    try {
        const { name, email, password, phone = "", specialization, experience = 0 } = req.body;
        if (!name?.trim() || !email?.trim() || !password || !specialization?.trim()) {
            return res.status(400).json({ message: "Name, email, password, and specialization are required." });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }
        const years = Number(experience);
        if (!Number.isFinite(years) || years < 0) {
            return res.status(400).json({ message: "Experience must be a non-negative number." });
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (await usersModel.exists({ email: normalizedEmail })) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        const doctor = await usersModel.create({
            name: name.trim(),
            username: normalizedEmail,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            phone: phone.trim(),
            specialization: specialization.trim(),
            experience: years,
            role: "doctor",
        });
        return res.status(201).json({
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialization,
                experience: doctor.experience,
                role: doctor.role,
                isActive: doctor.isActive,
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function updateDoctor(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid doctor ID." });
        }
        const { name, email, phone = "", specialization, experience } = req.body;
        if (
            typeof name !== "string"
            || !name.trim()
            || typeof email !== "string"
            || !email.trim()
            || typeof specialization !== "string"
            || !specialization.trim()
            || typeof phone !== "string"
        ) {
            return res.status(400).json({ message: "Name, email, and specialization are required." });
        }
        const years = Number(experience);
        if (!Number.isFinite(years) || years < 0) {
            return res.status(400).json({ message: "Experience must be a non-negative number." });
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (await usersModel.exists({ email: normalizedEmail, _id: { $ne: req.params.id } })) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        const doctor = await usersModel.findOneAndUpdate(
            { _id: req.params.id, role: "doctor" },
            {
                name: name.trim(),
                username: normalizedEmail,
                email: normalizedEmail,
                phone: phone.trim(),
                specialization: specialization.trim(),
                experience: years,
            },
            { new: true, runValidators: true },
        ).select("name email role phone specialization experience isActive");
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }
        return res.json({ doctor });
    } catch (error) {
        return next(error);
    }
}

export async function createAdmin(req, res, next) {
    try {
        const { name, email, password, phone = "" } = req.body;
        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (await usersModel.exists({ email: normalizedEmail })) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        const admin = await usersModel.create({
            name: name.trim(),
            username: normalizedEmail,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            phone: phone.trim(),
            role: "admin",
        });
        return res.status(201).json({
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function setUserStatus(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }
        if (typeof req.body.isActive !== "boolean") {
            return res.status(400).json({ message: "isActive must be true or false." });
        }
        const user = await usersModel.findOneAndUpdate(
            { _id: req.params.id, role: { $in: ["patient", "doctor"] } },
            { isActive: req.body.isActive },
            { new: true },
        ).select("name email role isActive");
        if (!user) {
            return res.status(404).json({ message: "Patient or doctor not found." });
        }
        return res.json({ user });
    } catch (error) {
        return next(error);
    }
}

export async function deleteUser(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }
        const user = await usersModel.findOneAndDelete({
            _id: req.params.id,
            role: { $in: ["patient", "doctor"] },
        });
        if (!user) {
            return res.status(404).json({ message: "Patient or doctor not found." });
        }
        await appointmentsModel.deleteMany({ $or: [{ patient: user._id }, { doctor: user._id }] });
        return res.json({ message: `${user.role === "doctor" ? "Doctor" : "Patient"} account deleted.` });
    } catch (error) {
        return next(error);
    }
}
