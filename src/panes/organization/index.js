import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Slider, Select, DatePicker } from "antd";
import LineChart from "./components/LineChart";
import ForceGraph from "./components/ForceGraph";
import Chart from "../../components/Chart";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;
const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const Title = styled.h2`
  height: 30px;
  margin-bottom: 10px;
`;

const SubTitle = styled.h3``;

const SubPane = styled.div`
  width: 100%;
  margin-top: 10px;
  height: calc(50% - 55px);
  display: flex;
  flex-direction: column;
`;

const Control = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const Card = styled.div`
  background: #fff;
  padding: 8px;
  display: flex;
  align-items: center;
  width: calc(50% - 4px);
  height: 50px;
  & > span {
    font-weight: 500;
    display: inline-block;
    margin-right: 4px;
    width: 100px;
  }
`;

const OffsetSlider = styled(Slider)`
  width: calc(100% - 200px);
  margin-left: 16px;
`;

const StyledSelect = styled(Select)`
  width: 100px;
`;

const MyRow = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
`;

const Wrapper = styled.div`
  display: flex;
  width: ${(props) => props.width || "100%"};
  justify-content: space-between;
  height: 100%;
`;

export default connect(({ global }) => ({ ...global }), {
  setTimeOffSet: (value) => ({
    type: "global/setTimeOffSet",
    payload: { value },
  }),
  set: (key, value) => ({
    type: "global/set",
    payload: { key, value },
  }),
  getData: () => ({
    type: "global/getData",
  }),
})(function ({
  timeRange,
  selectedTimeRange,
  selectedGraphs,
  timeOffSet,
  selectedFields,
  fields,
  set,
  getData,
  dataByEtype,
  dataByKey,
  selectedPersonnel,
}) {
  const [selectedName, setSelectedName] = useState("template");
  const validTimeOffset = timeOffSet.filter(([name]) => {
    const set = new Set(selectedGraphs);
    return set.has(name);
  });
  let selectedTimeOffset = validTimeOffset.find((d) => d[0] === selectedName);
  if (!selectedTimeOffset && validTimeOffset.length) {
    selectedTimeOffset = validTimeOffset[0];
  }

  const lineData = selectedFields
    .map((d) => {
      const item = fields.find((f) => f.value === d);
      return item;
    })
    .map((d) => {
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

  const forceData = dataByKey
    .map(({ key, data }) => {
      const [, offsetDay] = timeOffSet.find(([name]) => name === key);
      return {
        key,
        data: data.map((d) => ({
          ...d,
          Time: d.Time + offsetDay * 24 * 60 * 60,
        })),
      };
    })
    .filter((d) => {
      const set = new Set(selectedGraphs);
      return set.has(d.key);
    });

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container>
      <Title>Organization</Title>
      <Control>
        <Card>
          <span>Time Range</span>
          <RangePicker
            onChange={(_, [startString, endString]) => {
              const start = (new Date(startString).getTime() / 1000) | 0;
              const end = (new Date(endString).getTime() / 1000) | 0;
              set("selectedTimeRange", [start, end]);
            }}
            value={[moment(timeRange[0] * 1000), moment(timeRange[1] * 1000)]}
          />
        </Card>
        {selectedTimeOffset && (
          <Card>
            <span>Time Offset</span>
            <StyledSelect
              value={selectedTimeOffset[0]}
              onChange={setSelectedName}
            >
              {validTimeOffset.map(([name], index) => (
                <Option key={name} value={name}>
                  {name}
                </Option>
              ))}
            </StyledSelect>
            <OffsetSlider
              defaultValue={0}
              min={0}
              max={365}
              value={selectedTimeOffset[1]}
              onChange={(v) => {
                const newTimeOffset = [...timeOffSet];
                const item = newTimeOffset.find(
                  (d) => d[0] === selectedTimeOffset[0]
                );
                const index = newTimeOffset.indexOf(item);
                newTimeOffset[index] = [item[0], v];
                set("timeOffSet", newTimeOffset);
              }}
            />
          </Card>
        )}
      </Control>
      <SubPane>
        <SubTitle>Activity</SubTitle>
        <MyRow>
          <Wrapper width={Math.max(lineData.length * 50, 100) + "%"}>
            {lineData.map((d) => (
              <Chart
                key={d.name}
                width={
                  lineData.length
                    ? `calc(${(100 / lineData.length) | 0}% - 4px)`
                    : "100%"
                }
                height="100%"
              >
                <LineChart
                  data={d}
                  timeRange={selectedTimeRange}
                  selectedGraphs={selectedGraphs}
                  selectedFeilds={selectedFields}
                />
              </Chart>
            ))}
          </Wrapper>
        </MyRow>
      </SubPane>
      <SubPane>
        <SubTitle>Structure</SubTitle>
        <MyRow>
          <Wrapper width={Math.max(forceData.length * 50, 100) + "%"}>
            {forceData
              .filter((d) => {
                const set = new Set(selectedGraphs);
                return set.has(d.key);
              })
              .map((d) => (
                <Chart
                  key={d.key}
                  width={
                    lineData.length
                      ? `calc(${(100 / forceData.length) | 0}% - 4px)`
                      : "100%"
                  }
                >
                  <ForceGraph
                    d={d}
                    timeRange={selectedTimeRange}
                    edges={selectedFields}
                    fields={fields}
                    set={set}
                    selectedPersonnel={selectedPersonnel}
                  />
                </Chart>
              ))}
          </Wrapper>
        </MyRow>
      </SubPane>
    </Container>
  );
});
