import React,{ useState} from "react";
import { Button,TimePicker } from "antd";
import ShiftModal from "./components/modal";
import './styles/shift.css'
import Tablee from './components/Table'
const index = () => {
        const [isModalVisible, setIsModalVisible] = useState(false);
const showModal = () => {
    console.log("showModal");
    setIsModalVisible(true);
};

// Hide Modal
const hideModal = () => {
    setIsModalVisible(false);
};
    return (
        <>
            <h1>Shift</h1>
            <div className="buttonshift">
                <Button
                    text="Send Invite"
                    onClick={showModal}
                    style={{
                        backgroundColor: "black",
                        color: "white",
                        marginBottom: "20px",
                    }}
                >
                    Create Shift
                </Button>
            </div>
            <Tablee/>
            {/* <TimePicker.RangePicker /> */}
            <ShiftModal
                isVisible={isModalVisible}
                // onSend={handleSendInvite}
                // loading={loading}
                onCancel={hideModal}
            />
        </>
    );
};

export default index;
