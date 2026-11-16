import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import app from "./src/app.js"
import connectDB from "./src/db/db.js"

config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });
const port = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Copy Backend/.env.example to Backend/.env and set a long, random secret.");
}

await connectDB();
app.listen(port, () => {
    console.log(`Clinic API listening on port ${port}`);
});