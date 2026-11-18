import { useEffect, useState } from "react";
import api, { getErrorMessage } from "./api.js";
import { showAlert } from "./alerts.js";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AuthPage from "./components/AuthPage.jsx";
import DoctorDashboard from "./components/DoctorDashboard.jsx";
import PatientDashboard from "./components/PatientDashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";

const dashboardTitles = {
    overview: "Your day, made a little easier",
    doctors: "A good place to start",
    appointments: "Your care, all in one place",
    requests: "Your care, all in one place",
    users: "A community of care",
};

function currentDate() {
    return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState("overview");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        api.get("/auth/me")
            .then(({ data }) => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        function navigateFromDashboard(event) {
            setPage(event.detail);
        }
        window.addEventListener("wellnest:navigate", navigateFromDashboard);
        return () => window.removeEventListener("wellnest:navigate", navigateFromDashboard);
    }, []);

    async function signOut() {
        try {
            await api.post("/auth/logout");
        } catch (requestError) {
            showAlert("error", getErrorMessage(requestError));
        } finally {
            setUser(null);
            setPage("overview");
        }
    }

    if (loading) {
        return <main className="loading-screen"><span className="loading-mark">+</span><span>Making room for your care...</span></main>;
    }
    if (!user) return <AuthPage onAuthenticated={(authenticatedUser) => { setUser(authenticatedUser); setPage("overview"); }} />;

    return (
        <div className="app-shell">
            <div className={`mobile-scrim ${mobileMenuOpen ? "visible" : ""}`} onClick={() => setMobileMenuOpen(false)} />
            <div className={`sidebar-wrap ${mobileMenuOpen ? "open" : ""}`}>
                <Sidebar user={user} activePage={page} onNavigate={(nextPage) => { setPage(nextPage); setMobileMenuOpen(false); }} onLogout={signOut} />
            </div>
            <main className="main-panel">
                <header className="topbar">
                    <button className="mobile-menu-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle menu">☰</button>
                    <div className="breadcrumb"><span>wellnest</span><span className="breadcrumb-slash">/</span><strong>{page[0].toUpperCase() + page.slice(1)}</strong></div>
                    <div className="topbar-right"><span className="topbar-date">{currentDate()}</span><span className="topbar-divider" /><span className="topbar-greeting">{dashboardTitles[page]}</span><span className="topbar-spark">✳</span></div>
                </header>
                {user.role === "patient" && <PatientDashboard user={user} page={page} />}
                {user.role === "doctor" && <DoctorDashboard user={user} page={page} />}
                {user.role === "admin" && <AdminDashboard page={page} />}
                <footer className="app-footer"><span>© {new Date().getFullYear()} wellnest health</span><span>Made for better care <b>✳</b></span></footer>
            </main>
        </div>
    );
}
