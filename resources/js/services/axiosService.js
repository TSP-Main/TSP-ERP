import axios_ from "axios";

// Define the token type
const TOKEN_TYPE = 'Bearer';
//  const url = 'http://127.0.0.1:8000/api';
const url=import.meta.env.VITE_APP_URL

// Create an Axios instance with a base URL
const axios = axios_.create({
  baseURL: `${url}`, // Update to your actual API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});


axios.interceptors.request.use(
  async config => {
    const token=  localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `${TOKEN_TYPE} ${token}`}
    return config;
  },
  error => Promise.reject(error),
);


export default axios
