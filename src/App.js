import React, { useState } from "react";
import styled from "styled-components";

import SiderPane from "./panes/sider";
import OrganizationPane from "./panes/organization";
import PersonnelPane from "./panes/personnel";

const Container = styled.div`
  height: 100%;
  width: 100%;
  background: #e2e9f3;
`;

const Header = styled.div`
  height: 49px;
  background: #fff;
  padding: 8px;
  display: flex;
  align-items: baseline;
  & > h3 {
    margin-left: 10px;
  }
`;

const Title = styled.span`
  font-weight: bold;
  font-size: 20px;
  color: #000;
`;

const Content = styled.div`
  display: flex;
  height: calc(100% - 49px);
  width: 100%;
`;

const Sider = styled.div`
  background: #38425d;
  height: 100%;
  width: ${(props) => props.width}px;
  color: #fff;
`;

const Left = styled.div`
  width: calc(70% - 4px);
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  padding: 8px;
`;

const Right = styled.div`
  width: calc(30% - 4px);
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  padding: 8px;
`;

const Main = styled.div`
  background: #e2e9f3;
  width: calc(100% - ${(props) => props.width}px);
  display: flex;
  padding: 8px;
  justify-content: space-between;
  margin-left: ${(props) => (props.hide ? 20 : 0)}px;
`;

function App() {
  const [siderWidth, setSiderWidth] = useState(200);
  return (
    <Container>
      <Header>
        <Title>CA2</Title>
        <h3>Cyber Attacks Analytics</h3>
      </Header>
      <Content>
        <Sider width={siderWidth}>
          <SiderPane setWidth={setSiderWidth} width={siderWidth} />
        </Sider>
        <Main width={siderWidth} hide={siderWidth === 0}>
          <Left>
            <OrganizationPane />
          </Left>
          <Right>
            <PersonnelPane />
          </Right>
        </Main>
      </Content>
    </Container>
  );
}

export default App;
