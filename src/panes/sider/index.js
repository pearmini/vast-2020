import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import Card from "./components/Card";

const Container = styled.div`
  padding: 8px;
`;

export default connect(({ global }) => ({ ...global }), {
  set: (key, value) => ({
    type: "global/set",
    payload: { key, value },
  }),
})(function ({ selectedGraphs, graphs, selectedFields, fields, set }) {
  const extraGraph = graphs.filter(
    (d) => selectedGraphs.find((s) => s === d) === undefined
  );
  const extraFields = fields.filter(
    (d) => selectedFields.find((s) => s === d.value) === undefined
  );

  return (
    <Container>
      <Card
        title="Data"
        onAdd={(index) => {
          const newSelectedGraph = [...selectedGraphs, extraGraph[index]];
          set("selectedGraphs", newSelectedGraph);
        }}
        onRemove={(index) => {
          const newSelectedGraph = [...selectedGraphs];
          newSelectedGraph.splice(index, 1);
          set("selectedGraphs", newSelectedGraph);
        }}
        list={selectedGraphs}
        extraList={extraGraph}
        onUpload={() => {}}
      />
      <Card
        title="Fields"
        onAdd={(index) => {
          const newSelectedFields = [
            ...selectedFields,
            extraFields[index].value,
          ];
          set("selectedFields", newSelectedFields);
        }}
        onRemove={(index) => {
          const newSelectedFields = [...selectedFields];
          newSelectedFields.splice(index, 1);
          set("selectedFields", newSelectedFields);
        }}
        list={selectedFields.map((d) => fields.find((s) => s.value === d))}
        extraList={extraFields}
        value={(d) => d.name}
      />
    </Container>
  );
});
