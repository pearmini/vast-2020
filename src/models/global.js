import * as d3All from "d3";
import * as d3Array from "d3-array";
import template from "../data/template.csv";
import g1 from "../data/g1.csv";
import g2 from "../data/g2.csv";
import g3 from "../data/g3.csv";
import g4 from "../data/g4.csv";
import g5 from "../data/g5.csv";

const d3 = {
  ...d3All,
  ...d3Array,
};

function readCSV() {
  const filelist = [
    { name: "template", url: template },
    { name: "g1", url: g1 },
    { name: "g2", url: g2 },
    { name: "g3", url: g3 },
    { name: "g4", url: g4 },
    { name: "g5", url: g5 },
  ];
  return Promise.all(filelist.map((d) => d3.csv(d.url))).then((data) =>
    Promise.resolve(
      data.map((d, index) => ({
        data: d,
        key: filelist[index].name,
      }))
    )
  );
}

function preprocess(raw) {
  const namevalues = raw
    .flatMap(({ key, data }) =>
      data.map((d) => ({ ...d, key, Time: +d.Time, eType: +d.eType }))
    )
    .filter((d) => d.eType !== 4 && d.eType !== 5)
    .map((d) => ({
      ...d,
      eType: d.eType === 2 || d.eType === 3 ? 7 : d.eType,
    }));

  const timeRange = d3.extent(namevalues, (d) => d.Time);
  const dataByEtype = Array.from(d3.groups(namevalues, (d) => d.eType));
  return { dataByEtype, timeRange };
}

export default {
  namespace: "global",
  state: {
    dataByEtype: [],
    timeRange: [0, 0],
    selectedTimeRange: [0, 0],
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    setSelectedTimeRange(state, action) {
      const { value } = action.payload;
      return { ...state, selectedTimeRange: value };
    },
  },
  effects: {
    *getData(_, { call, put }) {
      const raw = yield call(readCSV);
      const { dataByEtype, timeRange } = preprocess(raw);
      yield put({
        type: "save",
        payload: { dataByEtype, timeRange, selectedTimeRange: timeRange },
      });
    },
  },
};
