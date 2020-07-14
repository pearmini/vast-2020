import * as d3All from "d3";
import * as d3Array from "d3-array";
import template from "../data/template.csv";
import g1 from "../data/g1.csv";
import g2 from "../data/g2.csv";
import g3 from "../data/g3.csv";
import g4 from "../data/g4.csv";
import g5 from "../data/g5.csv";
import dc from "../data/dc.csv";

const d3 = {
  ...d3All,
  ...d3Array,
};

function readGraphCSV() {
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

function readDcCSV() {
  return d3.csv(dc);
}

function offset(time) {
  return +time + (2025 - 1970) * 365 * 24 * 60 * 60;
}

function preprocessByEdge(raw) {
  const namevalues = raw
    .flatMap(({ key, data }) =>
      data.map((d) => ({ ...d, key, Time: offset(d.Time), eType: +d.eType }))
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
      .map((d) => ({ ...d, key, Time: offset(d.Time), eType: +d.eType }))
      .map((d) => ({
        ...d,
        eType: d.eType === 2 || d.eType === 3 ? 7 : d.eType, // 将 Procurement 设置为一类
      })),
  }));
  return {
    dataByKey,
  };
}

function preprocessBySource(raw) {
  const flatData = raw
    .flatMap(({ key, data }) =>
      data.map((d) => ({ ...d, key, Time: offset(d.Time), eType: +d.eType }))
    )
    .map((d) => ({
      ...d,
      eType: d.eType === 2 || d.eType === 3 ? 7 : d.eType, // 将 Procurement 设置为一类
    }));
  const dataBySource = d3.group(flatData, (d) => d.Source);
  return {
    dataBySource,
  };
}

function getCo(raw) {
  return raw
    .flatMap(({ key, data }) =>
      data.map((d) => ({ ...d, key, Time: offset(d.Time), eType: +d.eType }))
    )
    .filter((d) => d.eType === 6);
}

const graphs = ["template", "g1", "g2", "g3", "g4", "g5"];
const fields = [
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

export default {
  namespace: "global",
  state: {
    dataByEtype: [],
    timeRange: [0, 0],
    selectedTimeRange: [0, 0],
    dataByKey: [],
    dataBySource: d3.map(),
    graphs,
    selectedGraphs: ["template", "g1"],
    timeOffSet: graphs.map((d) => [d, 0]),
    selectedFields: [0, 1],
    selectedPersonnel: [],
    colorScaleForData: d3
      .scaleOrdinal()
      .domain(graphs)
      .range(d3.schemeCategory10),
    colorScaleForChannels: d3
      .scaleOrdinal()
      .domain(fields.map((d) => d.name))
      .range(d3.schemeAccent),
    fields,
    selectedPeople: [],
    dcByNodeID: d3.map(),
    highlightPersonnel: -1,
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
      const graphList = yield call(readGraphCSV);
      const dc = yield call(readDcCSV);
      const { dataByEtype, timeRange } = preprocessByEdge(graphList);
      const { dataByKey } = preprocessByKey(graphList);
      const { dataBySource } = preprocessBySource(graphList);
      const coData = getCo(graphList);
      console.log(coData);
      const dcByNodeID = d3.rollup(
        dc,
        ([d]) => d.Category,
        (d) => d.NodeID
      );
      yield put({
        type: "save",
        payload: {
          dataByEtype,
          timeRange,
          selectedTimeRange: timeRange,
          dataByKey,
          dataBySource,
          dcByNodeID,
        },
      });
    },
  },
};
