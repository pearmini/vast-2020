import React, { useEffect } from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Row, Col } from "antd";
import LineChart from "./components/LineChart";

const Container = styled.div``;

export default connect(({ global }) => ({ ...global }), {
  getData: () => ({ type: "global/getData" }),
})(function ({
  getData,
  dataByEtype,
  selectedTimeRange,
  selectedGraphs,
  timeOffSet,
}) {
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
    const offsetList =
      list &&
      list.map((d) => {
        const [, offsetDay] = timeOffSet.find(([name]) => name === d.key);
        return { ...d, Time: d.Time + offsetDay * 24 * 60 * 60 };
      });
    return { ...d, list: offsetList || [] };
  });

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container>
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
