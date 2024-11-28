import React, { useState } from "react";
import { Form, Input, Select } from "antd";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import styles from "./CustomInput.module.css"; // Import CSS Module

const { Option } = Select;

const CustomInput = ({ name, placeholder, type, options, rules, onChange }) => {
    // State to handle password visibility
    const [visible, setVisible] = useState(false);

    return (
        <Form.Item
            name={name}
            rules={rules}
            style={{ marginBottom: "7px", width: "100%" }}
        >
            {type === "select" ? (
                <Select
                    placeholder={placeholder}
                    onChange={onChange}
                    className={styles.customInput} // Apply custom class
                >
                    {options.map((option) => (
                        <Option key={option.value} value={option.value}>
                            {option.label}
                        </Option>
                    ))}
                </Select>
            ) : type === "password" ? (
                <Input
                    type={visible ? "text" : "password"}
                    placeholder={placeholder}
                    onChange={onChange}
                    className={styles.customInput} // Apply custom class
                    suffix={
                        visible ? (
                            <EyeTwoTone onClick={() => setVisible(!visible)} />
                        ) : (
                            <EyeInvisibleOutlined
                                onClick={() => setVisible(!visible)}
                            />
                        )
                    }
                />
            ) : (
                <Input
                    type={type}
                    placeholder={placeholder}
                    onChange={onChange}
                    className={styles.customInput} // Apply custom class
                />
            )}
        </Form.Item>
    );
};

export default CustomInput;
