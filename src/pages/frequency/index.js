import React from "react";
import PropTypes from "prop-types";
import connector from "../../connector";
import { Row, Col } from "antd";
import FrequencyHeatmap from "./components/FrequencyHeatmap";

const FrequencyHeatmapList = ({ selectedGraphs }) => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col>
          {selectedGraphs.map(name => <FrequencyHeatmap key={name} name={name} />)}
        </Col>
      </Row>
    </div>
  );
};

FrequencyHeatmapList.propTypes = {
  selectedGraphs: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default connector(FrequencyHeatmapList);
