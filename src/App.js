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
  align-items: center;
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
  width: calc(60% - 4px);
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  padding: 8px;
`;

const Right = styled.div`
  width: calc(40% - 4px);
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
        <Title>VAST 2020</Title>
      </Header>
      <Content>
        <Sider width={siderWidth}>
          <SiderPane setWidth={setSiderWidth} width={siderWidth} />
        </Sider>
        <Main width={siderWidth} hide={siderWidth === 0}>
          <Left width={60}>
            <OrganizationPane />
          </Left>
          <Right width={40}>
            <PersonnelPane />
          </Right>
        </Main>
      </Content>
    </Container>
  );
}

export default App;
