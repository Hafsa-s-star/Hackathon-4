const navigation = {
    patient: [
        { id: "overview", label: "Overview", icon: "⌂" },
        { id: "doctors", label: "Find a doctor", icon: "⌕" },
        { id: "appointments", label: "My appointments", icon: "▦" },
    ],
    doctor: [
        { id: "overview", label: "Overview", icon: "⌂" },
        { id: "requests", label: "Appointments", icon: "▦" },
    ],
    admin: [
        { id: "overview", label: "Overview", icon: "⌂" },
        { id: "users", label: "People", icon: "♧" },
        { id: "appointments", label: "Appointments", icon: "▦" },
    ],
};

const roleTitles = { patient: "Patient portal", doctor: "Doctor workspace", admin: "Admin console" };

export default function Sidebar({ user, activePage, onNavigate, onLogout }) {
    const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    return (
        <aside className="sidebar">
            <a className="brand" href="/" aria-label="wellnest home">
                <span className="brand-mark">+</span><span>wellnest<span className="brand-period">.</span></span>
            </a>
            <div className="workspace-label">WORKSPACE</div>
            <div className="role-pill"><span className="role-dot" />{roleTitles[user.role]}</div>
            <nav className="side-nav" aria-label="Main navigation">
                <span className="nav-caption">MENU</span>
                {navigation[user.role].map((item) => (
                    <button key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
                        <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.id === "appointments" && user.role === "patient" && <span className="nav-arrow">›</span>}
                    </button>
                ))}
            </nav>
            <div className="sidebar-bottom">
                <div className="support-card"><span className="support-spark">✳</span><strong>Here for you</strong><p>Questions about your care? We’re always happy to help.</p><a href="mailto:hello@wellnest.care">Get in touch <span>↗</span></a></div>
                <div className="profile-block">
                    <span className="avatar">{initials}</span>
                    <span className="profile-name"><strong>{user.name}</strong><small>{user.role === "doctor" ? user.specialization : roleTitles[user.role]}</small></span>
                    <button className="logout-button" onClick={onLogout} aria-label="Sign out" title="Sign out">↗</button>
                </div>
            </div>
        </aside>
    );
}
