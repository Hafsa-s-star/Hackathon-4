import usersModel from "../models/users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicUser(user) {
    return {
        id: user._id,
        name: user.name || user.username || user.email,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        experience: user.experience,
        isActive: user.isActive,
    };
}

function issueSession(user, res) {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
    );
    res.cookie("token", token, cookieOptions);
    return publicUser(user);
}

export async function registerUser(req, res, next) {
    try {
        const { name, email, password, phone = "", role } = req.body;
        if (role && role !== "patient") {
            return res.status(403).json({
                message: "Public registration is for patients only. An admin must create doctor or admin accounts.",
            });
        }
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
        const user = await usersModel.create({
            name: name.trim(),
            username: normalizedEmail,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            phone: phone.trim(),
            role: "patient",
        });
        return res.status(201).json({ message: "Your account is ready.", user: issueSession(user, res) });
    } catch (error) {
        return next(error);
    }
}

export async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const user = await usersModel.findOne({ email: email.trim().toLowerCase() }).select("+password");
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "The email or password is incorrect." });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: "This account has been deactivated. Please contact the clinic." });
        }
        return res.json({ message: "Welcome back.", user: issueSession(user, res) });
    } catch (error) {
        return next(error);
    }
}

export function logoutUser(req, res) {
    res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
    return res.json({ message: "You have been signed out." });
}

export function getCurrentUser(req, res) {
    return res.json({ user: publicUser(req.user) });
}
