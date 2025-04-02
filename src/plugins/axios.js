import axios from "axios";
import useUserStore from "@/stores/user.js";
import { useRouter } from 'vue-router';


const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

instance.interceptors.request.use(
    (config) => {
        const user = useUserStore();
        const token = user.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            window.location.href = "/login";
            return Promise.reject(new Error('未登入'));
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response的攔截器
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 403) {
            window.location.href = '/403';
        }
        return Promise.reject(error);
    }
);

export default instance;