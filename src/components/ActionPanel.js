import React, { useState, useEffect } from "react";
import styled from "styled-components";
import LineChart from "./LineChart";
import { connect } from "dva";
import { Row, Col, Select } from "antd";

const { Option } = Select;
const Container = styled.div``;
const Title = styled.h2``;
const MyRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export default connect(
  ({ loading, global }) => ({ ...global, loading: loading.models.global }),
  {
    getData: () => ({ type: "global/getData" }),
  }
)(function ({ getData, dataByEtype, selectedTimeRange }) {
  const graphs = ["template", "g1", "g2", "g3", "g4", "g5"];
  const [selectedGraphs, setSelectedGraphs] = useState(graphs);
  // const [timeOffSet, setTimeOffSet] = useState(graphs.map((d) => [d, 0]));
  const titles = [
    {
      name: "Phone",
      value: 0,
    },
    {
      name: "Email",
      value: 1,
    },
    {
      name: "Transaction",
      value: 7,
    },
    {
      name: "Travel",
      value: 6,
    },
  ];
  const data = titles.map((d) => {
    const { value } = d;
    const [, list] = dataByEtype.find(([i]) => i === value) || [];
    return { ...d, list: list || [] };
  });

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container>
      <Title>行为可视化</Title>
      <MyRow>
        选择查看的图：
        <Select
          mode="multiple"
          value={selectedGraphs}
          onChange={setSelectedGraphs}
        >
          {graphs.map((d) => (
            <Option key={d}>{d}</Option>
          ))}
        </Select>
      </MyRow>
      <Row gutter={[16, 16]}>
        {data.map((d) => (
          <Col key={d.name} span={12}>
            <LineChart
              data={d}
              timeRange={selectedTimeRange}
              selectedGraphs={selectedGraphs}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
});
