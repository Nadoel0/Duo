import axios from "axios";

const API_URL = 'https://192.168.1.228:3000/api/auth';

export const register = (email, password) => {
    return axios.post(`${API_URL}/register`, { email, password });
}

export const login = (email, password) => {
    return axios.post(`${API_URL}/login`, { email, password });
}