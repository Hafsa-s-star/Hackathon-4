import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import usersModel from "../src/models/users.model.js";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before creating an admin.");
}
if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
}

try {
    await mongoose.connect(MONGODB_URI);
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const exists = await usersModel.exists({ email });
    if (exists) {
        throw new Error("An account already uses ADMIN_EMAIL.");
    }
    await usersModel.create({
        name: ADMIN_NAME.trim(),
        email,
        username: email,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "admin",
    });
    console.log(`Admin account created for ${email}.`);
} finally {
    await mongoose.disconnect();
}
