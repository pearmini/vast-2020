export default {
  namespace: "organization",
  state: {
    timeRange: [],
    selectedTimeRange: [],
    timeOffSet: [],
    dataByEtype: [],
    dataByKey: [],
    mapData: [],
  },
  reducers: {
    init(state, action) {
      return { ...state, ...action.payload };
    },
    setTimeOffSet(state, action) {
      const { value, selectedTimeOffset } = action.payload;
      const { timeOffSet } = state;
      const newTimeOffset = [...timeOffSet];
      const item = newTimeOffset.find((d) => d[0] === selectedTimeOffset[0]);
      const index = newTimeOffset.indexOf(item);
      newTimeOffset[index] = [item[0], value];
      return { ...state, timeOffSet: newTimeOffset };
    },
    setSelectedTimeRange(state, action) {
      const { range } = action.payload;
      const format = (d) => (new Date(d).getTime() / 1000) | 0;
      return { ...state, selectedTimeRange: range.map(format) };
    },
    updateGraphs(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
