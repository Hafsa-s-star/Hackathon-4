import app from "../src/app.js";
import connectDB from "../src/db/db.js";

let connection;

async function ensureDBConnection() {
    if (!connection) {
        connection = connectDB().catch((error) => {
            connection = undefined;
            throw error;
        });
    }
    await connection;
}

export default async function handler(req, res) {
    await ensureDBConnection();
    return app(req, res);
}
