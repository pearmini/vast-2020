import * as d3All from "d3";
import * as d3Array from "d3-array";
import template from "../data/template.csv";
import g1 from "../data/g1.csv";
import g2 from "../data/g2.csv";
import g3 from "../data/g3.csv";
import g4 from "../data/g4.csv";
import g5 from "../data/g5.csv";
import final from "../data/final.csv"
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
    { name: "final", url: final },
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
    .filter((d) => d.eType !== 4 && d.eType !== 5); // 去掉 Demographics 和 Co-authorship

  const timeRange = d3.extent(namevalues, (d) => d.Time);
  const dataByEtype = Array.from(d3.groups(namevalues, (d) => d.eType));
  return { dataByEtype, timeRange };
}

function preprocessByKey(raw) {
  // 暂时先保留电话和邮件的边
  const dataByKey = raw.map(({ data, key }) => ({
    key,
    data: data.map((d) => ({
      ...d,
      key,
      Time: offset(d.Time),
      eType: +d.eType,
    })),
  }));
  return {
    dataByKey,
  };
}

function preprocessBySource(raw) {
  const flatData = raw.flatMap(({ key, data }) =>
    data.map((d) => ({ ...d, key, Time: offset(d.Time), eType: +d.eType }))
  );
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
    .filter((d) => d.eType === 4);
}

function getMap(raw) {
  // 找到有 SourceLocation 的数据
  const edges = raw
    .flatMap(({ key, data }) =>
      data.map((d) => ({ ...d, key, Time: offset(d.Time), eType: +d.eType }))
    )
    .filter((d) => d.eType === 6 || d.eType === 0 || d.eType === 1)
    .filter((d) => d.SourceLocation !== "");

  const locationByCountry = d3.map();
  for (let e of edges) {
    const source = [e.SourceLocation, e.SourceLatitude, e.SourceLongitude];
    const target = [e.TargetLocation, e.TargetLatitude, e.TargetLongitude];
    const locations = [source, target].filter((d) => d[0] !== "");
    locations.forEach((d) => {
      const locations = locationByCountry.get(d[0]);
      const newLocations = d[1] ? [[d[1], d[2]]] : [];
      if (locations) {
        locationByCountry.set(d[0], [...locations, ...newLocations]);
      } else {
        locationByCountry.set(d[0], newLocations);
      }
    });
  }

  return locationByCountry.entries().map(({ key, value }) => {
    const minX = d3.min(value, (d) => +d[0]),
      maxX = d3.max(value, (d) => +d[0]);
    const minY = d3.min(value, (d) => +d[1]),
      maxY = d3.max(value, (d) => +d[1]);
    return {
      key,
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      r: Math.max(maxX - minY, maxY - minY) / 2,
    };
  });
}

function getPro(raw) {
  return raw
    .flatMap(({ key, data }) =>
      data.map((d) => ({ ...d, key, Time: offset(d.Time), eType: +d.eType }))
    )
    .filter((d) => d.eType === 2 || d.eType === 3);
}

function preprocess(graphList, dc) {
  const { dataByEtype, timeRange } = preprocessByEdge(graphList);
  const { dataByKey } = preprocessByKey(graphList);
  const { dataBySource } = preprocessBySource(graphList);

  const coData = getCo(graphList);
  const mapData = getMap(graphList);
  const proData = getPro(graphList);

  const coLabelData = Array.from(
    new Set(coData.map((d) => d.Target))
  ).map((d) => [d, d]);

  const dcLabelData = Array.from(
    d3.rollup(
      dc,
      ([d]) => d.Category,
      (d) => d.NodeID
    )
  );

  const proLabelData = Array.from(
    new Set(proData.map((d) => `${d.Target}+${d.Weight}`))
  ).map((d) => {
    const [key, weight] = d.split("+");
    return [key, key, weight];
  });

  const traLabelData = mapData.map((d) => [d.key, d.key]);

  return {
    dataByEtype,
    timeRange,
    selectedTimeRange: timeRange,
    dataByKey,
    dataBySource,
    dcLabelData,
    coLabelData,
    proLabelData,
    traLabelData,
    mapData,
  };
}

const graphs = ["template", "g1", "g2", "g3", "g4", "g5", "final"];
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
    name: "Sell",
    value: 2,
  },
  {
    name: "Buy",
    value: 3,
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
    mapData: [],
    coData: [],
    proData: [],
  },
  reducers: {
    addGraph(state, action) {
      const { key } = action.payload;
      const { graphs, timeOffSet, dataByKey } = state;
      return {
        ...state,
        graphs: [...graphs, key],
        timeOffSet: [...timeOffSet, [key, 0]],
        dataByKey: [...dataByKey, { key, data: [] }],
        colorScaleForData: d3
          .scaleOrdinal()
          .domain(graphs)
          .range(d3.schemeCategory10),
      };
    },
    addEdge(state, action) {
      const { key, edge } = action.payload;
      const { graphList, dc } = state;
      const newGraphList = [...graphList];
      const g = graphList.find((d) => d.key === key);
      const i = graphList.indexOf(g);
      newGraphList[i].data.push(edge);
      const payload = preprocess(newGraphList, dc);
      return {
        ...state,
        ...payload,
        graphList: newGraphList,
      };
    },
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
      const payload = preprocess(graphList, dc);
      yield put({
        type: "save",
        payload: {
          ...payload,
          graphList,
          dc,
        },
      });
    },
  },
};
