import React from "react";
import PropTypes from "prop-types";
import connector from "../../connector";
import ActivityChart from "./components/ActivityChart";
import styled from 'styled-components';

const Container = styled.div`
  width: auto;
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
`;

const ActivityPane = ({ selectedGraphs }) => {
  return (
    <Container>
      <h2>Activities</h2>
      {selectedGraphs.map(name => <ActivityChart key={name} name={name} />)}
    </Container>
  );
};

ActivityPane.propTypes = {
  selectedGraphs: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default connector(ActivityPane);
