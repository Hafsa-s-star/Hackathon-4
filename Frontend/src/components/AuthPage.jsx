import { useState } from "react";
import api from "../api.js";
import { getErrorMessage } from "../api.js";
import { showAlert } from "../alerts.js";

export default function AuthPage({ onAuthenticated }) {
    const [mode, setMode] = useState("login");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        const form = new FormData(event.currentTarget);
        const payload = Object.fromEntries(form.entries());
        try {
            const { data } = await api.post(`/auth/${mode === "login" ? "login" : "register"}`, payload);
            onAuthenticated(data.user);
        } catch (requestError) {
            showAlert("error", getErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-story">
                <a className="brand brand-light" href="/">
                    <span className="brand-mark">+</span>
                    <span>wellnest<span className="brand-period">.</span></span>
                </a>
                <div className="story-content">
                    <span className="eyebrow eyebrow-light">CARE THAT FITS YOUR LIFE</span>
                    <h1>A healthier you<br />starts <em>right here.</em></h1>
                    <p>Thoughtful care, trusted doctors, and a little more peace of mind — all in one place.</p>
                    <div className="story-perks">
                        <span><b>01</b> Find your right-fit doctor</span>
                        <span><b>02</b> Book a time that works</span>
                        <span><b>03</b> Feel good about your care</span>
                    </div>
                </div>
                <div className="story-foot"><span>Better care, closer to home.</span><span>✳</span></div>
                <div className="story-orb orb-one" />
                <div className="story-orb orb-two" />
            </section>
            <section className="auth-form-side">
                <div className="auth-form-wrap">
                    <div className="auth-mobile-brand brand">
                        <span className="brand-mark">+</span><span>wellnest<span className="brand-period">.</span></span>
                    </div>
                    <span className="eyebrow">{mode === "login" ? "YOUR CARE, IN ONE PLACE" : "LET'S GET YOU STARTED"}</span>
                    <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
                    <p className="form-intro">{mode === "login" ? "Sign in to pick up where you left off." : "A few details and you're ready to find your doctor."}</p>
                    <div className="auth-switch" role="tablist" aria-label="Account options">
                        <button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Sign in</button>
                        <button className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Create account</button>
                    </div>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === "register" && (
                            <>
                                <label>Full name<input name="name" placeholder="e.g. Jamie Parker" autoComplete="name" required /></label>
                                <label>Phone number <span className="optional">Optional</span><input name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" /></label>
                            </>
                        )}
                        <label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label>
                        <label>Password<input name="password" type="password" placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} required /></label>
                        <button className="button button-primary auth-submit" disabled={submitting}>
                            {submitting ? "One moment..." : mode === "login" ? "Sign in to wellnest" : "Create my account"}
                            <span aria-hidden="true">→</span>
                        </button>
                    </form>
                    <p className="auth-note">Your health information is private and protected.</p>
                </div>
            </section>
        </main>
    );
}
