import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    withCredentials: true,
});

export function getErrorMessage(error) {
    if (!error.response) {
        return "We can't reach the clinic server. Start the backend and configure Backend/.env, then try again.";
    }
    return error.response.data?.message || "We couldn't complete that request. Please try again.";
}

export default api;
