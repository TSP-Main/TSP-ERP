import { Spin } from 'antd';
import React from 'react'
const Loading = () => {
  return (
      <div
          style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh", // Full viewport height
          }}
      >
          <Spin tip="Loading data..." size="large" />
      </div>
  );
}

export default Loading
