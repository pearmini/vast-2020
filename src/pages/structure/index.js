import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import { Row, Col } from "antd";
import ForceGraph from "./components/ForceGraph";

const Container = styled.div``;

export default connect(({ global }) => ({
  ...global,
}))(function ({ dataByKey, selectedTimeRange, selectedGraphs, timeOffSet }) {
  const data = dataByKey.map(({ key, data }) => {
    const [, offsetDay] = timeOffSet.find(([name]) => name === key);
    return {
      key,
      data: data.map((d) => ({
        ...d,
        Time: d.Time + offsetDay * 24 * 60 * 60,
      })),
    };
  });
  const getSpan = () => {
    const len = selectedGraphs.length;
    if (len <= 1) {
      return 24;
    } else if (len === 2 || len === 4) {
      return 12;
    } else {
      return 8;
    }
  };
  return (
    <Container>
      {
        <Row gutter={[16, 16]}>
          {data
            .filter((d) => {
              const set = new Set(selectedGraphs);
              return set.has(d.key);
            })
            .map((d) => (
              <Col key={d.key} span={getSpan()}>
                <ForceGraph d={d} timeRange={selectedTimeRange} />
              </Col>
            ))}
        </Row>
      }
    </Container>
  );
});
