import React from "react";
import { connect } from "dva";
import { Slider } from "antd";
import styled from "styled-components";

const StyledSlider = styled(Slider)`
  width: 400px;
`;

const MyRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export default connect(
  ({ loading, global }) => ({ ...global, loading: loading.models.global }),
  {
    setSelectedTimeRange: (value) => ({
      type: "global/setSelectedTimeRange",
      payload: { value },
    }),
  }
)(function ({ timeRange, selectedTimeRange, setSelectedTimeRange }) {
  return (
    <MyRow>
      选择时间范围：
      <StyledSlider
        range
        min={timeRange[0]}
        max={timeRange[1]}
        value={selectedTimeRange}
        onChange={setSelectedTimeRange}
        tipFormatter={(d) => new Date(d * 1000).toLocaleDateString()}
      />
    </MyRow>
  );
});
