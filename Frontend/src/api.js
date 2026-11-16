import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://hackathon-4-tan.vercel.app/api",
    withCredentials: true,
});

export function getErrorMessage(error) {
    if (!error.response) {
        return "We can't reach the clinic server. Start the backend and configure Backend/.env, then try again.";
    }
    if (error.response.data?.message) {
        return error.response.data.message;
    }
    if (error.response.status === 404) {
        return `The clinic API route was not found (${error.config?.url || "unknown route"}). Check the API URL and restart the backend.`;
    }
    if (error.response.status >= 500) {
        return `The clinic server returned an error (${error.response.status}). Check the Backend terminal for details.`;
    }
    return `The request failed with HTTP ${error.response.status}. Check the API response and try again.`;
}

export default api;
