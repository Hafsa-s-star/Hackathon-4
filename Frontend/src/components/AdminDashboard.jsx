import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api.js";
import AppointmentList from "./AppointmentList.jsx";
import StatCard from "./StatCard.jsx";

function DoctorForm({ onClose, onCreated }) {
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        const values = Object.fromEntries(new FormData(event.currentTarget).entries());
        try {
            await api.post("/admin/doctors", values);
            onCreated();
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="doctor-form-title">
                <button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
                <span className="eyebrow">GROW YOUR CARE TEAM</span><h2 id="doctor-form-title">Add a doctor</h2>
                <p className="modal-subtitle">Create a secure account for a new specialist.</p>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <label>Full name<input name="name" placeholder="e.g. Alex Morgan" required /></label>
                    <label>Email address<input name="email" type="email" placeholder="doctor@wellnest.care" required /></label>
                    <div className="form-grid">
                        <label>Specialization<input name="specialization" placeholder="e.g. Cardiology" required /></label>
                        <label>Years of experience<input name="experience" type="number" min="0" defaultValue="0" required /></label>
                    </div>
                    <label>Phone number<input name="phone" type="tel" placeholder="Optional" /></label>
                    <label>Temporary password<input name="password" type="password" minLength="8" placeholder="At least 8 characters" required /></label>
                    {error && <p className="form-error">{error}</p>}
                    <button className="button button-primary modal-submit" disabled={submitting}>{submitting ? "Creating account..." : "Create doctor account"} <span>→</span></button>
                </form>
            </section>
        </div>
    );
}

export default function AdminDashboard({ page }) {
    const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [appointmentSearch, setAppointmentSearch] = useState("");
    const [userType, setUserType] = useState("all");
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    function loadDashboard() {
        return Promise.all([api.get("/admin/stats"), api.get("/admin/users")])
            .then(([statsResponse, usersResponse]) => {
                setStats(statsResponse.data.stats);
                setUsers(usersResponse.data.users);
            });
    }

    useEffect(() => {
        loadDashboard().catch((requestError) => setError(getErrorMessage(requestError)));
    }, []);

    useEffect(() => {
        const patientName = page === "appointments" ? appointmentSearch.trim() : "";
        api.get("/admin/appointments", { params: patientName ? { patientName } : {} })
            .then(({ data }) => setAppointments(data.appointments))
            .catch((requestError) => setError(getErrorMessage(requestError)));
    }, [page, appointmentSearch]);

    const visibleUsers = useMemo(() => users.filter((user) => {
        const matchesRole = userType === "all" || user.role === userType;
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || [user.name, user.email, user.specialization].some((value) => value?.toLowerCase().includes(query));
        return matchesRole && matchesSearch;
    }), [users, userType, search]);

    async function setActive(user, isActive) {
        try {
            await api.patch(`/admin/users/${user._id}/status`, { isActive });
            setUsers((items) => items.map((item) => item._id === user._id ? { ...item, isActive } : item));
            setNotice(`${user.name}'s account ${isActive ? "activated" : "deactivated"}.`);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        }
    }

    async function removeUser(user) {
        if (!window.confirm(`Permanently delete ${user.name}'s account and appointments?`)) return;
        try {
            await api.delete(`/admin/users/${user._id}`);
            await loadDashboard();
            setAppointments((items) => items.filter((item) => item.patient?._id !== user._id && item.doctor?._id !== user._id));
            setNotice(`${user.name}'s account was deleted.`);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        }
    }

    async function doctorCreated() {
        setShowDoctorForm(false);
        await loadDashboard();
        setNotice("Doctor account created. They can now sign in.");
    }

    return (
        <div className="dashboard-content">
            <div className="page-heading"><div><span className="eyebrow">CLINIC OVERVIEW</span><h1>{page === "users" ? "People & accounts" : page === "appointments" ? "All appointments" : <>The heart of <em>wellnest.</em></>}</h1><p>{page === "users" ? "Manage the people who make great care possible." : page === "appointments" ? "A clear view of every patient visit." : "A healthy clinic starts with a clear picture."}</p></div>{page !== "appointments" && <button className="button button-primary" onClick={() => setShowDoctorForm(true)}><span>＋</span> Add a doctor</button>}</div>
            {notice && <div className="notice-banner"><span>✓</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}
            {error && <div className="notice-error" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}
            {page === "overview" && <>
                <section className="admin-welcome"><div><span className="welcome-kicker">A LITTLE GOOD GOES A LONG WAY</span><h2>Care is a team effort.<br /><em>Look at yours go.</em></h2><p>Here's a look at the people and appointments behind your clinic.</p></div><div className="admin-welcome-art"><span>✳</span><span>♡</span><span>✳</span></div></section>
                <section className="stats-grid">
                    <StatCard label="Registered patients" value={stats.patients} note="People in your care community" accent="mint" icon="♧" />
                    <StatCard label="Doctors" value={stats.doctors} note="Specialists on your team" accent="lavender" icon="✳" />
                    <StatCard label="Appointments" value={stats.appointments} note="Across all appointment statuses" accent="peach" icon="▦" />
                </section>
            </>}
            {(page === "overview" || page === "users") && <section className={`content-section ${page === "users" ? "first-section" : ""}`}>
                <div className="section-heading"><div><span className="eyebrow">YOUR CLINIC COMMUNITY</span><h2>People</h2></div><button className="text-link" onClick={() => setShowDoctorForm(true)}>＋ Add doctor</button></div>
                <div className="table-toolbar">
                    <div className="filter-tabs" role="tablist" aria-label="Filter users">
                        {[["all", "Everyone"], ["patient", "Patients"], ["doctor", "Doctors"]].map(([value, label]) => <button key={value} className={userType === value ? "selected" : ""} onClick={() => setUserType(value)}>{label}</button>)}
                    </div>
                    <label className="search-box search-small"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people" aria-label="Search users" /></label>
                </div>
                <div className="people-table-wrap"><table className="people-table"><thead><tr><th>PERSON</th><th>ROLE</th><th>CONTACT</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
                    {visibleUsers.map((user) => <tr key={user._id}>
                        <td><span className="table-person"><span className={`table-avatar ${user.role}`}>{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.specialization || user.email}</small></span></span></td>
                        <td><span className={`role-label ${user.role}`}>{user.role}</span></td>
                        <td className="table-contact">{user.email}</td>
                        <td><span className={`account-status ${user.isActive ? "active" : "inactive"}`}><i />{user.isActive ? "Active" : "Inactive"}</span></td>
                        <td>{user.role === "admin" ? <span className="account-status">Administrator</span> : <div className="table-actions"><button onClick={() => setActive(user, !user.isActive)}>{user.isActive ? "Deactivate" : "Activate"}</button><button className="delete-action" onClick={() => removeUser(user)}>Delete</button></div>}</td>
                    </tr>)}
                    {!visibleUsers.length && <tr><td className="table-empty" colSpan="5">No people match your search.</td></tr>}
                </tbody></table></div>
            </section>}
            {(page === "overview" || page === "appointments") && <section className={`content-section ${page === "appointments" ? "first-section" : ""}`}>
                <div className="section-heading"><div><span className="eyebrow">THE CLINIC CALENDAR</span><h2>{page === "overview" ? "Recent appointments" : "Every visit, at a glance"}</h2></div>{page === "appointments" && <label className="search-box search-small"><span>⌕</span><input value={appointmentSearch} onChange={(event) => setAppointmentSearch(event.target.value)} placeholder="Search patient name" aria-label="Search appointments by patient name" /></label>}</div>
                <AppointmentList appointments={page === "overview" ? appointments.slice(0, 5) : appointments} role="admin" emptyMessage="Appointments will appear here as soon as they're booked." />
            </section>}
            {showDoctorForm && <DoctorForm onClose={() => setShowDoctorForm(false)} onCreated={doctorCreated} />}
        </div>
    );
}
