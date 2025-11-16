import { useState } from "react";
import "./App.css";
import Upload from "./views/upload";
import "antd/dist/reset.css";
import { Layout, Menu } from "antd";
import { BrowserRouter } from "react-router-dom";
import {
  UploadOutlined,
  ProfileOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

const { Header, Footer, Sider, Content } = Layout;

function Shell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const siderWidth = 200;

  const items = [
    { key: "/upload", icon: <UploadOutlined />, label: "上传" },
    { key: "/tasks", icon: <ProfileOutlined />, label: "任务/历史" },
    { key: "/settings", icon: <SettingOutlined />, label: "设置" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 左侧菜单栏 */}

      <Sider>
        <div className="app-sider-container">
          <div
            style={{
              height: 48,
              marginLeft:16,
              marginRight: 16,
              marginBottom:16,
              color: "#fff",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            BioAnalysis
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={items}
            onClick={(e) => navigate(e.key)}
          />
        </div>
      </Sider>

      {/* 右侧内容区域 */}

      <Content style={{ margin: 16 }}>
        <div
          style={{
            padding: 16,
            background: "#fff",
            borderRadius: 8,
            minHeight: "100%",
            minWidth: 1200,
            width: "100%"
          }}
        >
          <Routes>
            <Route path="/upload" element={<Upload />} />
            {/* 任何其它路径重定向到 /upload */}
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </div>
      </Content>
    </Layout>
  );
}

function App() {
  // const navigate = useNavigate();
  // const { pathname } = useLocation();

  // Sider 菜单项

  return (
    <>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </>
  );
}

export default App;
