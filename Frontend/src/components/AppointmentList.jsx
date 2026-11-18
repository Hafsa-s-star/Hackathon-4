const statusLabels = {
    pending: "Awaiting confirmation",
    approved: "Confirmed",
    rejected: "Declined",
    cancelled: "Cancelled",
};

export function StatusBadge({ status }) {
    return <span className={`status-badge status-${status}`}>{statusLabels[status] || status}</span>;
}

function formatDate(value) {
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

export default function AppointmentList({ appointments, role, onCancel, onStatusChange, emptyMessage }) {
    if (!appointments.length) {
        return <div className="empty-state"><span className="empty-icon">✳</span><strong>Nothing on the calendar yet</strong><p>{emptyMessage}</p></div>;
    }

    return (
        <div className="appointment-list">
            {appointments.map((appointment) => {
                const person = role === "doctor" || role === "admin" ? appointment.patient : appointment.doctor;
                const heading = person?.name || "Account unavailable";
                return (
                    <article className="appointment-row" key={appointment._id}>
                        <div className="appointment-date">
                            <span>{formatDate(appointment.appointmentDate)}</span>
                            <strong>{appointment.appointmentTime}</strong>
                        </div>
                        <span className="appointment-person-avatar">{heading.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
                        <div className="appointment-summary">
                            <strong>{heading}</strong>
                            <span>{role === "doctor" ? appointment.patient?.email : role === "admin" ? `Dr. ${appointment.doctor?.name || "Unavailable"} · ${appointment.doctor?.specialization || "Doctor"}` : person?.specialization || "Clinic appointment"}</span>
                            <p>{appointment.reason}</p>
                        </div>
                        <div className="appointment-actions">
                            <StatusBadge status={appointment.status} />
                            {role === "patient" && appointment.status === "pending" && <button className="text-button" onClick={() => onCancel(appointment._id)}>Cancel</button>}
                            {(role === "doctor" || role === "admin") && appointment.status === "pending" && (
                                <span className="decision-actions">
                                    <button className="approve-button" onClick={() => onStatusChange(appointment._id, "approved")}>Approve</button>
                                    <button className="reject-button" onClick={() => onStatusChange(appointment._id, "rejected")}>Decline</button>
                                </span>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
