import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import DcMatrix from "./components/Matrix";
import { Tabs, Empty } from "antd";
import Chart from "../../components/Chart";
import BarChart from "./components/BarChart";

const { TabPane } = Tabs;

const Title = styled.h2``;

const SubPane = styled.div`
  margin-bottom: 10px;
`;

const Rect = styled.div`
  position: relative;
  padding-top: calc(90%);
`;

const Wrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

const Container = styled.div`
  height: 100%;
  position: relative;
`;

const EmptyWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export default connect(({ global }) => ({ ...global }))(function ({
  selectedPersonnel,
  dataBySource,
  dcLabelData,
  coLabelData,
  traLabelData,
  proLabelData,
  colorScaleForData,
  colorScaleForChannels,
  highlightPersonnel,
}) {
  const personnel = selectedPersonnel.map((d) => ({
    list: dataBySource.get(d) || [],
    key: d,
  }));

  const barData = personnel.map(({ key, list }) => ({
    id: key,
    data: [
      { name: "Phone", count: list.filter((d) => d.eType === 0).length },
      { name: "Email", count: list.filter((d) => d.eType === 1).length },
      { name: "Sell", count: list.filter((d) => d.eType === 2).length },
      { name: "Buy", count: list.filter((d) => d.eType === 3).length },
      {
        name: "Co-authorship",
        count: list.filter((d) => d.eType === 4).length,
      },
      { name: "Demographics", count: list.filter((d) => d.eType === 5).length },
      { name: "Travel", count: list.filter((d) => d.eType === 6).length },
    ],
  }));

  const dcData = personnel.map(({ key, list }) => ({
    key,
    list: list.filter((d) => d.eType === 5),
  }));

  const coData = personnel.map(({ key, list }) => ({
    key,
    list: list.filter((d) => d.eType === 4),
  }));

  const proData = personnel.map(({ key, list }) => ({
    key,
    list: list.filter((d) => d.eType === 2 || d.eType === 3),
  }));

  const traData = personnel.map(({ key, list }) => ({
    key,
    list: list.filter((d) => d.eType === 6),
  }));

  return (
    <Container>
      <Title>Personnel</Title>
      {selectedPersonnel.length ? (
        <>
          <SubPane>
            <Tabs defaultActiveKey="1">
              {barData.map((d) => (
                <TabPane tab={d.id} key={d.id}>
                  <Chart>
                    <BarChart
                      data={d.data}
                      color={colorScaleForChannels}
                      name={d.id}
                    />
                  </Chart>
                </TabPane>
              ))}
            </Tabs>
          </SubPane>
          <SubPane>
            <Tabs defaultActiveKey="1">
              <TabPane tab={"Demographics"} key="1">
                <Rect>
                  <Wrapper>
                    <DcMatrix
                      data={dcData}
                      names={dcLabelData}
                      color={colorScaleForData}
                      highlightPersonnel={highlightPersonnel}
                    />
                  </Wrapper>
                </Rect>
              </TabPane>
              <TabPane tab={"Co-authorship"} key="2">
                <Rect>
                  <Wrapper>
                    <DcMatrix
                      data={coData}
                      names={coLabelData}
                      color={colorScaleForData}
                      highlightPersonnel={highlightPersonnel}
                    />
                  </Wrapper>
                </Rect>
              </TabPane>
              <TabPane tab={"Procurement"} key="3">
                <Rect>
                  <Wrapper>
                    <DcMatrix
                      data={proData}
                      names={proLabelData}
                      color={colorScaleForData}
                      highlightPersonnel={highlightPersonnel}
                    />
                  </Wrapper>
                </Rect>
              </TabPane>
              <TabPane tab={"Travel"} key="4">
                <Rect>
                  <Wrapper>
                    <DcMatrix
                      data={traData}
                      names={traLabelData}
                      color={colorScaleForData}
                      highlightPersonnel={highlightPersonnel}
                      compare={(l, d) =>
                        l.TargetLocation === d[0] || l.SourceLocation === d[0]
                      }
                    />
                  </Wrapper>
                </Rect>
              </TabPane>
            </Tabs>
          </SubPane>
        </>
      ) : (
        <EmptyWrapper>
          <Empty description="no selected personnel" />
        </EmptyWrapper>
      )}
    </Container>
  );
});