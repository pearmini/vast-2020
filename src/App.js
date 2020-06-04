import React from "react";
import styled from "styled-components";
import "antd/dist/antd.css";
import CommonPanel from "./components/CommonPanel";
import ActionPanel from "./components/ActionPanel";
// import PersonPanel from "./components/PersonPanel";

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
      <CommonPanel />
      <ActionPanel />
      {/* <PersonPanel /> */}
    </Container>
  );
}

export default App;
