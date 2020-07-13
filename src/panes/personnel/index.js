import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import DcMatrix from "./components/DCMatrix";

const Title = styled.h2``;

const SubPane = styled.div``;
const SubTitle = styled.h3``;

const Container = styled.div``;

export default connect(({ global }) => ({ ...global }))(function ({
  selectedPersonnel,
  dataBySource,
  dcByNodeID,
  graphs,
}) {
  const personnel = selectedPersonnel.map((d) => ({
    list: dataBySource.get(d) || [],
    key: d,
  }));
  const dcData = personnel.map(({ key, list }) => ({
    key,
    list: list.filter((d) => d.eType === 5),
  }));

  return (
    <Container>
      <Title>Personnel</Title>
      <SubPane>
        <SubTitle>Demographics</SubTitle>
        <DcMatrix data={dcData} nameByNodeID={dcByNodeID} graphs={graphs} />
      </SubPane>
      <SubPane>
        <SubTitle>Travel</SubTitle>
      </SubPane>
    </Container>
  );
});
