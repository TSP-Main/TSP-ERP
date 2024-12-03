import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
import { notification } from "antd";

const loginService = {

    login: async (values) => {
        try {
            const response = await axios.post(apiRoutes.login, values);
            if (response.data.status === 200) {
                notification.success({
                   
                    description: response.data.message,
                    duration: 3,
                });
            }
            return response;
        } catch (error) {
            notification.error({
                
                description: error.response?.data?.message || "Login failed",
                duration: 3,
            });
            throw error;
        }
    },
};

export default loginService;
