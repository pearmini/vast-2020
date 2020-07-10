import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { VegaLite } from "react-vega";
import useCSV from "../../../hooks/use-csv";
import { nameUrlMap } from "../../../data";
import _ from "lodash";

function preprocess(edges) {
  return _(edges)
    .filter((x) => x.eType !== 5 && x.eType !== 4)
    .groupBy((x) => x.Source)
    .mapValues((xs) => {
      const minTime = _.minBy(xs, (x) => x.Time).Time;
      return xs.flatMap((x) =>
        x.eType === 0 || x.eType === 1
          ? [
              { person: x.Source, time: (x.Time - minTime) * 1000 },
              { person: x.Target, time: (x.Time - minTime) * 1000 },
            ]
          : [{ person: x.Source, time: (x.Time - minTime) * 1000 }]
      );
    })
    .values()
    .map((xs) => {
      xs.forEach((x) => (x.order = xs.length));
      return xs;
    })
    .flatten()
    .value();
}

const FrequencyHeatmap = ({ name }) => {
  const { data } = useCSV(nameUrlMap[name]);
  const spec = useMemo(
    () =>
      data === undefined
        ? undefined
        : {
            width: 800,
            height: 250,
            mark: "rect",
            data: { values: preprocess(data) },
            encoding: {
              x: { type: "quantitative", field: "time", bin: { maxbins: 200 } },
              y: {
                type: "nominal",
                field: "person",
                sort: { field: "order", order: "descending" },
              },
              color: { type: "quantitative", aggregate: "count" },
            },
          },
    [data]
  );
  return spec === undefined ? null : <VegaLite spec={spec} />;
};

FrequencyHeatmap.propTypes = {
  name: PropTypes.string.isRequired,
};

export default FrequencyHeatmap;
