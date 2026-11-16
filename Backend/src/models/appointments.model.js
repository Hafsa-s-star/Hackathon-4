import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
}, { timestamps: true });

appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1, status: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });

const appointmentsModel = mongoose.model("Appointment", appointmentSchema);
export default appointmentsModel;
