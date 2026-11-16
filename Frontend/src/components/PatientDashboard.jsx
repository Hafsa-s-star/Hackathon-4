import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { getErrorMessage } from "../api.js";
import AppointmentList, { StatusBadge } from "./AppointmentList.jsx";
import DoctorCard from "./DoctorCard.jsx";
import StatCard from "./StatCard.jsx";

function AppointmentModal({ doctor, onClose, onCreated }) {
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const minDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        const values = Object.fromEntries(new FormData(event.currentTarget).entries());
        try {
            await api.post("/appointments", { ...values, doctorId: doctor._id });
            onCreated();
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="book-title">
                <button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
                <span className="eyebrow">YOUR NEXT STEP</span>
                <h2 id="book-title">Book a visit</h2>
                <p className="modal-subtitle">A little time for your health goes a long way.</p>
                <div className="modal-doctor"><span className="doctor-avatar">{doctor.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div><strong>Dr. {doctor.name}</strong><span>{doctor.specialization}</span></div></div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <label>Date<input type="date" name="appointmentDate" min={minDate} required /></label>
                        <label>Time<input type="time" name="appointmentTime" required /></label>
                    </div>
                    <label>What would you like help with?<textarea name="reason" placeholder="Share a little about what brings you in..." rows="3" maxLength="500" required /></label>
                    {error && <p className="form-error">{error}</p>}
                    <button className="button button-primary modal-submit" disabled={submitting}>{submitting ? "Requesting..." : "Request appointment"} <span>→</span></button>
                </form>
            </section>
        </div>
    );
}

function todayLabel() {
    return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
}

export default function PatientDashboard({ user, page }) {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [specializations, setSpecializations] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const previousStatuses = useRef(null);

    const loadAppointments = useCallback(() => api.get("/appointments/my").then(({ data }) => {
        const nextAppointments = data.appointments;
        if (previousStatuses.current) {
            const updatedAppointment = nextAppointments.find((appointment) => (
                previousStatuses.current.get(appointment._id) === "pending"
                && ["approved", "rejected"].includes(appointment.status)
            ));
            if (updatedAppointment) {
                const outcome = updatedAppointment.status === "approved" ? "confirmed" : "updated";
                setNotice(`Dr. ${updatedAppointment.doctor?.name || "Your doctor"} has ${outcome} your appointment.`);
            }
        }
        previousStatuses.current = new Map(nextAppointments.map((appointment) => [appointment._id, appointment.status]));
        setAppointments(nextAppointments);
    }), []);
    useEffect(() => {
        if (page === "overview" || page === "doctors") {
            api.get("/doctors", { params: { search, specialization } })
                .then(({ data }) => {
                    setDoctors(data.doctors);
                    setSpecializations(data.specializations);
                })
                .catch((requestError) => setError(getErrorMessage(requestError)));
        }
    }, [page, search, specialization]);
    useEffect(() => {
        if (page !== "overview" && page !== "appointments") return undefined;
        const refresh = () => loadAppointments().catch((requestError) => setError(getErrorMessage(requestError)));
        refresh();
        const interval = window.setInterval(refresh, 30000);
        return () => window.clearInterval(interval);
    }, [page, loadAppointments]);

    const upcoming = useMemo(() => appointments.filter((item) => item.status === "approved" || item.status === "pending"), [appointments]);
    const appointmentUpdates = useMemo(
        () => appointments
            .filter((item) => item.status === "approved" || item.status === "rejected")
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 3),
        [appointments],
    );
    async function cancelAppointment(id) {
        try {
            await api.patch(`/appointments/${id}/cancel`);
            setAppointments((items) => items.map((item) => item._id === id ? { ...item, status: "cancelled" } : item));
            setNotice("Appointment cancelled.");
            window.setTimeout(() => setNotice(""), 3200);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        }
    }

    async function bookAppointment() {
        setSelectedDoctor(null);
        await loadAppointments();
        setNotice("Your appointment request is on its way. The clinic will be in touch.");
        window.setTimeout(() => setNotice(""), 4500);
    }

    const isDoctorPage = page === "doctors";
    const isAppointmentPage = page === "appointments";
    return (
        <div className="dashboard-content">
            <div className="page-heading">
                <div><span className="eyebrow">{isDoctorPage ? "YOUR CARE TEAM" : isAppointmentPage ? "YOUR VISITS" : todayLabel()}</span>
                    <h1>{isDoctorPage ? "Find your doctor" : isAppointmentPage ? "My appointments" : <>Good to see you, <em>{user.name.split(" ")[0]}.</em></>}</h1>
                    <p>{isDoctorPage ? "The right care starts with the right person." : isAppointmentPage ? "All your upcoming and past visits, together." : "A little care goes a long way. Here's your health at a glance."}</p>
                </div>
                {isDoctorPage && <div className="doctor-filters">
                    <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or specialty" aria-label="Search doctors by name or specialization" /></label>
                    <label className="specialization-filter"><span className="sr-only">Filter by specialization</span><select value={specialization} onChange={(event) => setSpecialization(event.target.value)}><option value="">All specialties</option>{specializations.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                </div>}
            </div>
            {notice && <div className="notice-banner"><span>✓</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}
            {error && <div className="notice-error" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}

            {page === "overview" && <>
                <section className="welcome-banner">
                    <div><span className="welcome-kicker">A MOMENT FOR YOU</span><h2>Your health is a journey.<br /><em>We're here for every step.</em></h2><p>Browse trusted specialists and find a time that feels right.</p><button className="button button-dark" onClick={() => window.dispatchEvent(new CustomEvent("wellnest:navigate", { detail: "doctors" }))}>Meet our doctors <span>→</span></button></div>
                    <div className="welcome-illustration" aria-hidden="true"><div className="sun-shape" /><div className="plant-shape">✳</div><div className="welcome-stamp">CARE<br />GROWS<br />HERE</div></div>
                </section>
                <section className="stats-grid">
                    <StatCard label="Appointments" value={appointments.length} note="Visits in your care history" accent="mint" icon="▦" />
                    <StatCard label="Coming up" value={upcoming.length} note="Pending or confirmed visits" accent="lavender" icon="◷" />
                    <StatCard label="Care team" value={doctors.length} note="Specialists ready to help" accent="peach" icon="✳" />
                </section>
                {appointmentUpdates.length > 0 && <section className="content-section">
                    <div className="section-heading"><div><span className="eyebrow">FROM YOUR CARE TEAM</span><h2>Appointment updates</h2></div></div>
                    <div className="update-list">{appointmentUpdates.map((appointment) => <article className={`update-card update-${appointment.status}`} key={appointment._id}>
                        <span className="update-icon">{appointment.status === "approved" ? "✓" : "!"}</span>
                        <div><strong>{appointment.status === "approved" ? "Your appointment is confirmed" : "Appointment request update"}</strong><p>Dr. {appointment.doctor?.name || "Your doctor"} · {appointment.appointmentDate?.slice(0, 10)} at {appointment.appointmentTime}</p></div>
                        <StatusBadge status={appointment.status} />
                    </article>)}</div>
                </section>}
                <section className="content-section">
                    <div className="section-heading"><div><span className="eyebrow">YOUR NEXT VISITS</span><h2>Appointments</h2></div><button className="text-link" onClick={() => window.dispatchEvent(new CustomEvent("wellnest:navigate", { detail: "appointments" }))}>View all <span>→</span></button></div>
                    <AppointmentList appointments={appointments.slice(0, 3)} role="patient" onCancel={cancelAppointment} emptyMessage="When you book a visit, you'll find all the details right here." />
                </section>
                <section className="content-section">
                    <div className="section-heading"><div><span className="eyebrow">HANDPICKED FOR YOU</span><h2>Meet your care team</h2></div><button className="text-link" onClick={() => window.dispatchEvent(new CustomEvent("wellnest:navigate", { detail: "doctors" }))}>All doctors <span>→</span></button></div>
                    <DoctorGrid doctors={doctors.slice(0, 3)} onBook={setSelectedDoctor} />
                </section>
            </>}
            {isDoctorPage && <section className="content-section first-section"><div className="section-heading"><div><span className="eyebrow">{doctors.length} SPECIALISTS</span><h2>Care starts with a conversation</h2></div></div><DoctorGrid doctors={doctors} onBook={setSelectedDoctor} /></section>}
            {isAppointmentPage && <section className="content-section first-section"><div className="section-heading"><div><span className="eyebrow">YOUR CARE TIMELINE</span><h2>Every visit, in one place</h2></div></div><AppointmentList appointments={appointments} role="patient" onCancel={cancelAppointment} emptyMessage="No visits booked yet. Your next step is just around the corner." /></section>}
            {selectedDoctor && <AppointmentModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} onCreated={bookAppointment} />}
        </div>
    );
}

function DoctorGrid({ doctors, onBook }) {
    if (!doctors.length) return <div className="empty-state"><span className="empty-icon">✳</span><strong>No doctors found</strong><p>Try a different name or specialty.</p></div>;
    return <div className="doctor-grid">{doctors.map((doctor) => <DoctorCard doctor={doctor} onBook={onBook} key={doctor._id} />)}</div>;
}
