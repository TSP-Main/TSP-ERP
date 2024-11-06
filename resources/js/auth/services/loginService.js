import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
import { notification } from "antd";

const loginService = {
    login: async (values) => {
        try {
            const response = await axios.post(apiRoutes.login, values);
            if (response.data.status === 200) {
                notification.success({
                    message: "Success",
                    description: response.data.message,
                });
                localStorage.setItem(
                    "access_token",
                    response.data.data.access_token
                );
            }
            return response;
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.response?.data?.message || "Login failed",
            });
            throw error;
        }
    },
};

export default loginService;
