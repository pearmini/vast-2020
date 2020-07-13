import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import Card from "./components/Card";
import { CloseCircleFilled } from "@ant-design/icons";

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

export default connect(({ global }) => ({ ...global }), {
  set: (key, value) => ({
    type: "global/set",
    payload: { key, value },
  }),
})(function ({
  selectedGraphs,
  graphs,
  selectedFields,
  fields,
  set,
  selectedPersonnel,
  setWidth,
  width,
}) {
  const extraGraph = graphs.filter(
    (d) => selectedGraphs.find((s) => s === d) === undefined
  );
  const extraFields = fields.filter(
    (d) => selectedFields.find((s) => s === d.value) === undefined
  );

  return (
    <Container>
      <Icon hide={width === 0}>
        <CloseCircleFilled
          onClick={() => {
            if (width === 200) {
              setWidth(0);
            } else {
              setWidth(200);
            }
          }}
        />
      </Icon>
      <Wrapper hide={width === 0}>
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
          title="Channels"
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
          type="combine"
        />
        {selectedPersonnel.length > 0 && (
          <Card
            title="Personnel"
            list={selectedPersonnel}
            onRemove={(index) => {
              const newSelectedPersonnel = [...selectedPersonnel];
              newSelectedPersonnel.splice(index, 1);
              set("selectedPersonnel", newSelectedPersonnel);
            }}
          />
        )}
      </Wrapper>
    </Container>
  );
});
