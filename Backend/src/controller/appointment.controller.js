import appointmentsModel from "../models/appointments.model.js";
import usersModel from "../models/users.model.js";

const appointmentDetails = [
    { path: "patient", select: "name email phone" },
    { path: "doctor", select: "name specialization experience" },
];

export async function createAppointment(req, res, next) {
    try {
        const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
        const date = new Date(`${appointmentDate}T${appointmentTime}`);
        if (
            !doctorId
            || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate || "")
            || !/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime || "")
            || Number.isNaN(date.getTime())
            || date <= new Date()
            || !reason?.trim()
        ) {
            return res.status(400).json({ message: "Choose a doctor, a future date and time, and add a reason for your visit." });
        }
        const doctor = await usersModel.findOne({ _id: doctorId, role: "doctor", isActive: true });
        if (!doctor) {
            return res.status(404).json({ message: "That doctor is no longer available." });
        }
        const occupied = await appointmentsModel.exists({
            doctor: doctorId,
            appointmentDate: new Date(`${appointmentDate}T12:00:00.000Z`),
            appointmentTime,
            status: { $in: ["pending", "approved"] },
        });
        if (occupied) {
            return res.status(409).json({ message: "That time is already requested. Please choose another slot." });
        }
        const appointment = await appointmentsModel.create({
            patient: req.user._id,
            doctor: doctor._id,
            appointmentDate: new Date(`${appointmentDate}T12:00:00.000Z`),
            appointmentTime,
            reason: reason.trim(),
        });
        await appointment.populate(appointmentDetails);
        return res.status(201).json({ appointment });
    } catch (error) {
        return next(error);
    }
}

export async function listPatientAppointments(req, res, next) {
    try {
        const appointments = await appointmentsModel.find({ patient: req.user._id })
            .populate(appointmentDetails)
            .sort({ appointmentDate: -1, appointmentTime: -1 });
        return res.json({ appointments });
    } catch (error) {
        return next(error);
    }
}

export async function cancelAppointment(req, res, next) {
    try {
        const appointment = await appointmentsModel.findOneAndUpdate(
            { _id: req.params.id, patient: req.user._id, status: "pending" },
            { status: "cancelled" },
            { new: true },
        ).populate(appointmentDetails);
        if (!appointment) {
            return res.status(404).json({ message: "Pending appointment not found. Only pending appointments can be cancelled." });
        }
        return res.json({ appointment });
    } catch (error) {
        return next(error);
    }
}

export async function listDoctorAppointments(req, res, next) {
    try {
        const appointments = await appointmentsModel.find({ doctor: req.user._id })
            .populate(appointmentDetails)
            .sort({ appointmentDate: 1, appointmentTime: 1 });
        return res.json({ appointments });
    } catch (error) {
        return next(error);
    }
}

export async function updateAppointmentStatus(req, res, next) {
    try {
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be approved or rejected." });
        }
        const appointment = await appointmentsModel.findOneAndUpdate(
            {
                _id: req.params.id,
                ...(req.user.role === "admin" ? {} : { doctor: req.user._id }),
                status: "pending",
            },
            { status },
            { new: true, runValidators: true },
        ).populate(appointmentDetails);
        if (!appointment) {
            return res.status(404).json({ message: "Pending appointment not found." });
        }
        return res.json({ appointment });
    } catch (error) {
        return next(error);
    }
}

export async function listAllAppointments(req, res, next) {
    try {
        const filter = {};
        const patientName = req.query.patientName?.trim();
        if (patientName) {
            const escaped = patientName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const patientIds = await usersModel.find({
                role: "patient",
                name: { $regex: escaped, $options: "i" },
            }).distinct("_id");
            filter.patient = { $in: patientIds };
        }
        const appointments = await appointmentsModel.find(filter)
            .populate(appointmentDetails)
            .sort({ appointmentDate: -1, appointmentTime: -1 });
        return res.json({ appointments });
    } catch (error) {
        return next(error);
    }
}
