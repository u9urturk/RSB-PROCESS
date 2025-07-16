import axios from "axios";

const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request/Response interceptors eklenebilir
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Hata yönetimi merkezi
        return Promise.reject(error);
    }
);

export default httpClient;