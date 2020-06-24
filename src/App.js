import React from "react";
import styled from "styled-components";
import { Tabs } from "antd";
import "antd/dist/antd.css";

import ControlPanel from "./pages/control";
import ActionPanel from "./pages/action";
import StructurePanel from "./pages/structure";

const { TabPane } = Tabs;

const Container = styled.div`
  padding: 0 10%;
`;

const Title = styled.h1`
  margin-top: 0.5em;
`;

function App() {
  return (
    <Container>
      <Title>VAST 2020</Title>
      <ControlPanel />
      <Tabs defaultActiveKey="1">
        <TabPane tab="行为可视化" key="1">
          <ActionPanel />
        </TabPane>
        <TabPane tab="组织结构可视化" key="2">
          <StructurePanel />
        </TabPane>
        <TabPane tab="人员可视化" key="3"></TabPane>
      </Tabs>
    </Container>
  );
}

export default App;
