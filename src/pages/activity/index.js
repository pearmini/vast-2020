import React from "react";
import PropTypes from "prop-types";
import connector from "../../connector";
import { Row, Col } from "antd";
import ActivityChart from "./components/ActivityChart";

const ActivityChartList = ({ selectedGraphs }) => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col>
          {selectedGraphs.map(name => <ActivityChart key={name} name={name} />)}
        </Col>
      </Row>
    </div>
  );
};

ActivityChartList.propTypes = {
  selectedGraphs: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default connector(ActivityChartList);
