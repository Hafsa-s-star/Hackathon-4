import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    phone: { type: String, trim: true, default: "" },
    specialization: { type: String, trim: true, default: "" },
    experience: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const usersModel = mongoose.models.User || mongoose.model("User", userSchema);
export default usersModel;
