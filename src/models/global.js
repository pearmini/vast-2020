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

function preprocessByEdge(raw) {
  const namevalues = raw
    .flatMap(({ key, data }) =>
      data.map((d) => ({ ...d, key, Time: +d.Time, eType: +d.eType }))
    )
    .filter((d) => d.eType !== 4 && d.eType !== 5) // 去掉 Demographics 和 Co-authorship
    .map((d) => ({
      ...d,
      eType: d.eType === 2 || d.eType === 3 ? 7 : d.eType, // 将 Procurement 设置为一类
    }));

  const timeRange = d3.extent(namevalues, (d) => d.Time);
  const dataByEtype = Array.from(d3.groups(namevalues, (d) => d.eType));
  return { dataByEtype, timeRange };
}

function preprocessByKey(raw) {
  // 暂时先保留电话和邮件的边
  const dataByKey = raw.map(({ data, key }) => ({
    key,
    data: data
      .map((d) => ({ ...d, key, Time: +d.Time, eType: +d.eType }))
      .map((d) => ({
        ...d,
        eType: d.eType === 2 || d.eType === 3 ? 7 : d.eType, // 将 Procurement 设置为一类
      }))
      // .filter((d) => d.eType === 0 || d.eType === 1)
  }));
  return {
    dataByKey,
  };
}

export default {
  namespace: "global",
  state: {
    dataByEtype: [],
    timeRange: [0, 0],
    selectedTimeRange: [0, 0],
    dataByKey: [],
    graphs: ["template", "g1", "g2", "g3", "g4", "g5"],
    selectedGraphs: ["template", "g1"],
    timeOffSet: ["template", "g1", "g2", "g3", "g4", "g5"].map((d) => [d, 0]),
    selectedFields: [0, 1],
    fields: [
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
    ],
    selectedPeople: [],
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    set(state, action) {
      const { key, value } = action.payload;
      return { ...state, [key]: value };
    },
  },
  effects: {
    *getData(_, { call, put }) {
      const raw = yield call(readCSV);
      const { dataByEtype, timeRange } = preprocessByEdge(raw);
      const { dataByKey } = preprocessByKey(raw);
      yield put({
        type: "save",
        payload: {
          dataByEtype,
          timeRange,
          selectedTimeRange: timeRange,
          dataByKey,
        },
      });
    },
  },
};
