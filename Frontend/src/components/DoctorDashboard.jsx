import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api.js";
import AppointmentList from "./AppointmentList.jsx";
import StatCard from "./StatCard.jsx";

export default function DoctorDashboard({ user, page }) {
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        api.get("/appointments/doctor")
            .then(({ data }) => setAppointments(data.appointments))
            .catch((requestError) => setError(getErrorMessage(requestError)));
    }, []);

    const pending = useMemo(() => appointments.filter((appointment) => appointment.status === "pending"), [appointments]);
    const upcoming = useMemo(() => appointments.filter((appointment) => appointment.status === "approved"), [appointments]);

    async function updateStatus(id, status) {
        try {
            const { data } = await api.patch(`/appointments/${id}/status`, { status });
            setAppointments((items) => items.map((item) => item._id === id ? data.appointment : item));
            setNotice(`Appointment ${status}.`);
            window.setTimeout(() => setNotice(""), 3200);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        }
    }

    return (
        <div className="dashboard-content">
            <div className="page-heading"><div><span className="eyebrow">{page === "requests" ? "YOUR PATIENTS" : "DOCTOR WORKSPACE"}</span><h1>{page === "requests" ? "Appointment requests" : <>Good morning, <em>Dr. {user.name.split(" ")[0]}.</em></>}</h1><p>{page === "requests" ? "Review each request and help your patients take their next step." : `${user.specialization || "Care provider"} · ${user.experience || 0} years of experience`}</p></div></div>
            {notice && <div className="notice-banner"><span>✓</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}
            {error && <div className="notice-error" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}
            {page === "overview" && <>
                <section className="doctor-welcome"><div className="doctor-welcome-mark">✳</div><div><span className="welcome-kicker">YOUR PRACTICE, AT A GLANCE</span><h2>Every good day starts with <em>good care.</em></h2><p>Your patients are counting on you. Here's what's on the calendar.</p></div><span className="doctor-welcome-decoration">+</span></section>
                <section className="stats-grid">
                    <StatCard label="Total appointments" value={appointments.length} note="Across your practice" accent="mint" icon="▦" />
                    <StatCard label="Needs your attention" value={pending.length} note="Requests awaiting a reply" accent="peach" icon="◷" />
                    <StatCard label="Confirmed visits" value={upcoming.length} note="Appointments on your calendar" accent="lavender" icon="✓" />
                </section>
                <section className="content-section"><div className="section-heading"><div><span className="eyebrow">YOUR PATIENTS</span><h2>Latest appointment requests</h2></div></div><AppointmentList appointments={appointments.slice(0, 4)} role="doctor" onStatusChange={updateStatus} emptyMessage="New appointment requests from your patients will show up here." /></section>
            </>}
            {page === "requests" && <section className="content-section first-section"><div className="section-heading"><div><span className="eyebrow">{pending.length} WAITING FOR YOUR REPLY</span><h2>All appointments</h2></div></div><AppointmentList appointments={appointments} role="doctor" onStatusChange={updateStatus} emptyMessage="There are no appointment requests yet." /></section>}
        </div>
    );
}
