import "array-flat-polyfill";

import * as d3All from "d3";
import * as d3Array from "d3-array";
import * as globalApi from "./service";

const d3 = {
  ...d3All,
  ...d3Array,
};

function preprocess(graphList, dc) {
  const { dataByEtype, timeRange } = preprocessByEdge(graphList);
  const { dataByKey } = preprocessByKey(graphList);
  const { dataBySource } = preprocessBySource(graphList);
  const graphs = graphList.map((d) => d.key);
  const timeOffSet = graphs.map((d) => [d, 0]);

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
    graphs,
    timeOffSet,
  };

  function offset(time) {
    return +time + (2025 - 1970) * 365 * 24 * 60 * 60;
  }

  function preprocessByEdge(raw) {
    const namevalues = raw
      .flatMap(({ key, data }) =>
        data.map((d) => ({
          ...d,
          key,
          Time: offset(d.Time),
          eType: +d.eType,
        }))
      )
      .filter((d) => d.eType !== 4 && d.eType !== 5); // 去掉 Demographics 和 Co-authorship

    const timeRange = d3.extent(namevalues, (d) => d.Time);
    const dataByEtype = Array.from(d3.groups(namevalues, (d) => d.eType));
    return { dataByEtype, timeRange };
  }

  function preprocessByKey(raw) {
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
        data.map((d) => ({
          ...d,
          key,
          Time: offset(d.Time),
          eType: +d.eType,
        }))
      )
      .filter((d) => d.eType === 4);
  }

  function getMap(raw) {
    const edges = raw
      .flatMap(({ key, data }) =>
        data.map((d) => ({
          ...d,
          key,
          Time: offset(d.Time),
          eType: +d.eType,
        }))
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
        r: Math.max(maxX - minX, maxY - minY) / 2,
      };
    });
  }

  function getPro(raw) {
    return raw
      .flatMap(({ key, data }) =>
        data.map((d) => ({
          ...d,
          key,
          Time: offset(d.Time),
          eType: +d.eType,
        }))
      )
      .filter((d) => d.eType === 2 || d.eType === 3);
  }
}

export default {
  namespace: "global",
  state: {
    graphs: [],
    graphList: [],
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
    ],
    selectedGraphs: ["template", "g1"],
    selectedFields: [0, 1],
    selectedPersonnel: [],
    createGraphs: [],
    colorsForData: d3.schemeCategory10,
    colorsForChannels: d3.schemeAccent,
    highlightPersonnel: -1,
  },
  effects: {
    *queryEdge(action, { call, put }) {
      const { value } = action.payload;
      const data = yield call(globalApi.queryEdge, value);
      yield put({
        type: "setQueryEdgeResult",
        payload: {
          data,
        },
      });
    },
    *addGraph(action, { _, put, select }) {
      const { key } = action.payload;
      const { graphs, createGraphs, graphList, selectedGraphs } = yield select(
        (state) => state.global
      );
      const { timeOffSet, dataByKey } = yield select(
        (state) => state.organization
      );
      const newGraph = { key, data: [] };
      yield put({
        type: "updateGraphs",
        payload: {
          graphs,
          createGraphs: [...createGraphs, key],
          graphList: [...graphList, newGraph],
          selectedGraphs: [...selectedGraphs, key],
        },
      });

      yield put({
        type: "organization/updateGraphs",
        payload: {
          timeOffSet: [...timeOffSet, [key, 0]],
          dataByKey: [...dataByKey, newGraph],
        },
      });
    },
    *getData(_, { call, put }) {
      const graphList = yield call(globalApi.readGraphCSV);
      const dc = yield call(globalApi.readDcCSV);
      yield put({
        type: "initData",
        payload: {
          graphList,
          dc,
        },
      });
    },
    *addEdge(action, { _, put, select }) {
      const { key, edge } = action.payload;
      const { graphList, dc } = yield select((state) => state.global);
      const newGraphList = [...graphList];
      const g = graphList.find((d) => d.key === key);
      const i = graphList.indexOf(g);
      newGraphList[i].data.push(edge);
      yield put({
        type: "initData",
        payload: {
          graphList: newGraphList,
          dc,
        },
      });
    },
    *initData(action, { _, put }) {
      const { graphList, dc } = action.payload;
      const {
        dataByEtype,
        timeRange,
        selectedTimeRange,
        dataByKey,
        timeOffSet,
        dataBySource,
        dcLabelData,
        coLabelData,
        proLabelData,
        traLabelData,
        mapData,
        graphs,
      } = preprocess(graphList, dc);

      yield put({
        type: "init",
        payload: {
          graphs,
          graphList,
          dc,
        },
      });

      yield put({
        type: "organization/init",
        payload: {
          timeRange,
          selectedTimeRange,
          timeOffSet,
          dataByEtype,
          dataByKey,
          mapData,
        },
      });

      yield put({
        type: "personnel/init",
        payload: {
          dataBySource,
          dcLabelData,
          coLabelData,
          proLabelData,
          traLabelData,
        },
      });
    },
  },
  reducers: {
    init(state, action) {
      return { ...state, ...action.payload };
    },
    addSelectedGraph(state, action) {
      const { graph } = action.payload;
      const { selectedGraphs } = state;
      return { ...state, selectedGraphs: [...selectedGraphs, graph] };
    },
    removeSelectedGraph(state, action) {
      const { index } = action.payload;
      const { selectedGraphs } = state;
      const newSelectedGraphs = [...selectedGraphs];
      newSelectedGraphs.splice(index, 1);
      return { ...state, selectedGraphs: newSelectedGraphs };
    },
    addSelectedField(state, action) {
      const { field } = action.payload;
      const { selectedFields } = state;
      return { ...state, selectedFields: [...selectedFields, field] };
    },
    removeSelectedField(state, action) {
      const { index } = action.payload;
      const { selectedFields } = state;
      const newSelectedFields = [...selectedFields];
      newSelectedFields.splice(index, 1);
      return { ...state, selectedFields: newSelectedFields };
    },
    setHighlightPersonnel(state, action) {
      const { id } = action.payload;
      return { ...state, highlightPersonnel: id };
    },
    addSelectedPersonnel(state, action) {
      const { id } = action.payload;
      const { selectedPersonnel } = state;
      return { ...state, selectedPersonnel: [...selectedPersonnel, id] };
    },
    removeSelectedPersonnel(state, action) {
      const { index } = action.payload;
      const { selectedPersonnel } = state;
      const newSelectedPersonnel = [...selectedPersonnel];
      newSelectedPersonnel.splice(index, 1);
      return { ...state, selectedPersonnel: newSelectedPersonnel };
    },
    toggleSelectedPersonnel(state, action) {
      const { id } = action.payload;
      const { selectedPersonnel } = state;
      const i = selectedPersonnel.indexOf(id);
      const newSelectedPersonnel = [...selectedPersonnel];
      if (i === -1) {
        newSelectedPersonnel.push(id);
      } else {
        newSelectedPersonnel.splice(i, 1);
      }
      return { ...state, selectedPersonnel: newSelectedPersonnel };
    },
    setQueryEdgeResult(state, action) {
      const { data } = action.payload;
      return { ...state, queryEdgeResult: data };
    },
    updateGraphs(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
