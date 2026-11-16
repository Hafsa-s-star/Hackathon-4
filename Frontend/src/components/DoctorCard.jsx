export default function DoctorCard({ doctor, onBook }) {
    const initials = doctor.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    return (
        <article className="doctor-card">
            <div className="doctor-card-top">
                <span className="doctor-avatar">{initials}</span>
                <span className="doctor-availability"><span /> Available</span>
            </div>
            <span className="doctor-specialty">{doctor.specialization || "General practice"}</span>
            <h3>Dr. {doctor.name}</h3>
            <p className="doctor-experience">{doctor.experience || 0} years of experience <span>·</span> Patient-first care</p>
            <div className="doctor-card-bottom">
                <span className="doctor-rating"><span>✦</span> Trusted care</span>
                <button className="button button-primary button-small" onClick={() => onBook(doctor)}>Book visit <span>→</span></button>
            </div>
        </article>
    );
}
