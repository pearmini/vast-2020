import React from "react";
import styled from "styled-components";

import SiderPane from "./panes/sider";
import OrganizationPane from "./panes/organization";
import ActivityPane from "./panes/activity";

const Container = styled.div`
  height: 100%;
  width: 100%;
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
  width: 200px;
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
  width: calc(100% - 200px);
  display: flex;
  padding: 8px;
  justify-content: space-between;
`;

function App() {
  return (
    <Container>
      <Header>
        <Title>VAST 2020</Title>
      </Header>
      <Content>
        <Sider>
          <SiderPane />
        </Sider>
        <Main>
          <Left width={60}>
            <OrganizationPane />
          </Left>
          <Right width={40}>
            <ActivityPane />
          </Right>
        </Main>
      </Content>
    </Container>
  );
}

export default App;
