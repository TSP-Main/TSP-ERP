import React from "react";
import { Form, Input, Select } from "antd";
import styles from "./CustomInput.module.css"; // Import CSS Module

const { Option } = Select;

const CustomInput = ({ name, placeholder, type, options, rules, onChange }) => {
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
