const accents = {
    mint: ["#e8f4ec", "#438b64"],
    lavender: ["#efedfa", "#8174c6"],
    peach: ["#fbefe5", "#d7884c"],
    blue: ["#e9eff8", "#6488bd"],
};

export default function StatCard({ label, value, note, accent = "mint", icon = "✳" }) {
    return (
        <article className="stat-card">
            <span className="stat-icon" style={{ backgroundColor: accents[accent][0], color: accents[accent][1] }}>{icon}</span>
            <span className="stat-label">{label}</span>
            <strong className="stat-value">{value}</strong>
            <span className="stat-note">{note}</span>
        </article>
    );
}
