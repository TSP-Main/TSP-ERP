import axios from '../../services/axiosService';
import { notification } from "antd";
import { useNavigate } from 'react-router-dom';
export const registerUser = async (values) => {
    const navigate=useNavigate();
    try {
        const response = await axios.post("/register", values);
        if (response.data.status === 200) {
            notification.success({
                message: "Success",
                description: response.data.message,
                duration: 3,
            });
            navigate('/')
        }
        return response;
    } catch (error) {
        notification.error({
            message: "Error",
            description: error.response?.data?.message || "Registration failed",
            duration: 3,
        });
        throw error;
    }
};
