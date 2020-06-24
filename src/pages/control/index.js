import React from "react";
import { connect } from "dva";
import { Slider, Select } from "antd";
import styled from "styled-components";

const { Option } = Select;
const Container = styled.div``;
const StyledSlider = styled(Slider)`
  width: 400px;
`;

const MyRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export default connect(({ global }) => ({ ...global }), {
  setSelectedTimeRange: (value) => ({
    type: "global/setSelectedTimeRange",
    payload: { value },
  }),
  setSelectedGraphs: (value) => ({
    type: "global/setSelectedGraphs",
    payload: { value },
  }),
  setTimeOffSet: (value) => ({
    type: "global/setTimeOffSet",
    payload: { value },
  }),
})(function ({
  timeRange,
  selectedTimeRange,
  setSelectedTimeRange,
  selectedGraphs,
  setSelectedGraphs,
  graphs,
  timeOffSet,
  setTimeOffSet,
}) {
  return (
    <Container>
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
      {timeOffSet
        .filter(([name]) => {
          const set = new Set(selectedGraphs);
          return set.has(name);
        })
        .map(([name, value]) => (
          <MyRow key={name}>
            {name + "的时间偏移："}
            <StyledSlider
              defaultValue={0}
              min={0}
              max={365}
              value={value}
              onChange={(v) => {
                const newTimeOffset = [...timeOffSet];
                const item = newTimeOffset.find(([n]) => n === name);
                const index = newTimeOffset.indexOf(item);
                newTimeOffset[index] = [name, v];
                setTimeOffSet(newTimeOffset);
              }}
            />
          </MyRow>
        ))}
    </Container>
  );
});
