import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import DcMatrix from "./components/DCMatrix";
import Chart from "../../components/Chart";

const Title = styled.h2``;

const SubPane = styled.div`
  margin-bottom: 10px;
`;

const Rect = styled.div`
  position: relative;
  padding-top: calc(100%);
`;

const Wrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

const SubTitle = styled.h3``;

const Container = styled.div`
  height: 100%;
`;

export default connect(({ global }) => ({ ...global }))(function ({
  selectedPersonnel,
  dataBySource,
  dcByNodeID,
  graphs,
  colorScaleForData,
  highlightPersonnel,
}) {
  const personnel = selectedPersonnel.map((d) => ({
    list: dataBySource.get(d) || [],
    key: d,
  }));

  const dcData = personnel.map(({ key, list }) => ({
    key,
    list: list.filter((d) => d.eType === 5),
  }));

  const coData = personnel.map(({ key, list }) => ({
    key,
    list: list.filter((d) => d.eType === 6),
  }));

  console.log(coData);
  return (
    <Container>
      <Title>Personnel</Title>
      <SubPane>
        <SubTitle>Demographics</SubTitle>
        <Rect>
          <Wrapper>
            <DcMatrix
              data={dcData}
              nameByNodeID={dcByNodeID}
              color={colorScaleForData}
              highlightPersonnel={highlightPersonnel}
            />
          </Wrapper>
        </Rect>
      </SubPane>
      <SubPane height={30}>
        <SubTitle>Co-authorship</SubTitle>
      </SubPane>
    </Container>
  );
});
