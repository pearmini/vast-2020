import * as d3 from "d3";

export default {
  namespace: "personnel",
  state: {
    dataBySource: d3.map(),
    dcLabelData: [],
    coLabelData: [],
    traLabelData: [],
    proLabelData: [],
  },
  reducers: {
    init(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
