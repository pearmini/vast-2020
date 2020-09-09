import React, { useEffect } from "react";
import { connect } from "dva";
import styled from "styled-components";
import Card from "./components/Card";
import { CloseCircleFilled } from "@ant-design/icons";
import * as d3 from "d3";

const Container = styled.div`
  padding: 8px;
  position: relative;
  padding-top: 25px;
`;

const Wrapper = styled.div`
  display: ${(props) => (props.hide ? "none" : "block")};
`;

const Icon = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  cursor: pointer;
  color: ${(props) => (props.hide ? "#38425d" : "white")};
  transform: ${(props) => (props.hide ? "rotate(45deg)" : "rotate(0deg)")};
  transition: all 0.5s;
`;

export default connect(
  ({ global, loading }) => ({ ...global, loading: loading.models.global }),
  {
    addSelectedField: (field) => ({
      type: "global/addSelectedField",
      payload: {
        field,
      },
    }),
    removeSelectedField: (index) => ({
      type: "global/removeSelectedField",
      payload: {
        index,
      },
    }),
    addSelectedGraph: (graph) => ({
      type: "global/addSelectedGraph",
      payload: {
        graph,
      },
    }),
    removeSelectedGraph: (index) => ({
      type: "global/removeSelectedGraph",
      payload: {
        index,
      },
    }),
    setHighlightPersonnel: (id) => ({
      type: "global/setHighlightPersonnel",
      payload: {
        id,
      },
    }),
    removeSelectedPersonnel: (index) => ({
      type: "global/removeSelectedPersonnel",
      payload: {
        index,
      },
    }),
    getData: () => ({
      type: "global/getData",
    }),
    addGraph: (key) => ({
      type: "global/addGraph",
      payload: { key },
    }),
    queryEdge: (value) => ({
      type: "global/queryEdge",
      payload: { value },
    }),
    addEdge: (key, value) => ({
      type: "global/addEdge",
      payload: {
        key,
        edge: value,
      },
    }),
  }
)(function ({
  graphs,
  fields,
  selectedGraphs,
  selectedFields,
  setWidth,
  width,
  selectedPersonnel,
  colorsForData,
  colorsForChannels,
  highlightPersonnel,
  setHighlightPersonnel,
  addGraph,
  queryEdge,
  addEdge,
  loading,
  queryEdgeResult,
  createGraphs,
  getData,
  addSelectedField,
  removeSelectedField,
  addSelectedGraph,
  removeSelectedGraph,
  removeSelectedPersonnel,
}) {
  const extraGraph = graphs.filter(
      (d) => selectedGraphs.find((s) => s === d) === undefined
    ),
    extraFields = fields.filter(
      (d) => selectedFields.find((s) => s === d.value) === undefined
    ),
    colorScaleForData = d3.scaleOrdinal().domain(graphs).range(colorsForData),
    colorScaleForChannels = d3
      .scaleOrdinal()
      .domain(fields.map((d) => d.name))
      .range(colorsForChannels);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container>
      <Icon hide={width === 0}>
        <CloseCircleFilled
          onClick={() => (width === 200 ? setWidth(0) : setWidth(200))}
        />
      </Icon>
      <Wrapper hide={width === 0}>
        <Card
          title="Data"
          onAdd={(index) => addSelectedGraph(extraGraph[index])}
          onRemove={removeSelectedGraph}
          list={selectedGraphs}
          extraList={extraGraph}
          onCreate={addGraph}
          colorScale={colorScaleForData}
          onQuery={queryEdge}
          loading={loading}
          queryEdgeResult={queryEdgeResult}
          createGraphs={createGraphs}
          onAddEdge={addEdge}
        />
        <Card
          title="Channels"
          onAdd={(index) => addSelectedField(extraFields[index].value)}
          onRemove={removeSelectedField}
          list={selectedFields.map((d) => fields.find((s) => s.value === d))}
          extraList={extraFields}
          value={(d) => d.name}
          type="combine"
          colorScale={colorScaleForChannels}
        />
        {selectedPersonnel.length > 0 && (
          <Card
            title="Personnel"
            list={selectedPersonnel}
            onMouseOver={(d) => setHighlightPersonnel(d)}
            onMouseLeave={() => setHighlightPersonnel(-1)}
            onRemove={removeSelectedPersonnel}
            colorScale={(id) =>
              highlightPersonnel === id ? "red" : "rgba(0, 0, 0, 0)"
            }
          />
        )}
      </Wrapper>
    </Container>
  );
});
