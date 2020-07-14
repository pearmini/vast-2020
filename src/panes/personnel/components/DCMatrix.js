import React from "react";
import Chart from "../../../components/Chart";
import styled from "styled-components";
import * as d3All from "d3";
import * as d3Array from "d3-array";

const d3 = {
  ...d3All,
  ...d3Array,
};

const Svg = styled.svg`
  width: 100%;
  height: 100%;
`;

export default function ({ nameByNodeID, data, highlightPersonnel, color }) {
  const width = 400,
    height = 400,
    margin = { top: 20, right: 20, bottom: 0, left: 30 },
    innerWidth = width - margin.left - margin.right;

  const names = Array.from(nameByNodeID);
  const translateX = 100;
  const cellWidth = data.length
    ? Math.min(30, (innerWidth - translateX) / data.length)
    : 30;

  const y = d3
    .scaleBand()
    .domain(names.map((d) => d[1]))
    .range([margin.top, height - margin.bottom]);

  const x = (index) => cellWidth * index;

  const rectColor = (d, key) => {
    if (highlightPersonnel === -1) {
      return d.has ? color(d.graph) : "#eee";
    } else {
      return +highlightPersonnel === +key && d.has ? "red" : "#eee";
    }
  };

  const wrapper = (list) =>
    names.map((d) => {
      const item = list.find((l) => l.Target === d[0]);
      return {
        key: d[1],
        has: item !== undefined,
        graph: item ? item.key : "",
      };
    });

  const text = (d) => (d.length > 10 ? d.slice(0, 10) + "..." : d);

  return (
    <Chart>
      <Svg viewBox={[0, 0, width, height]}>
        {names.map(([key, name]) => (
          <text key={name} y={y(name)} dy="1em" fontSize={11}>
            {text(name)}
            <title>{name}</title>
          </text>
        ))}
        <g transform={`translate(${translateX}, 0)`}>
          {data.map(({ key, list }, index) => (
            <g key={key} transform={`translate(${x(index)}, 0)`}>
              <text
                dy="1.7em"
                dx={-2}
                fontSize="8"
                transform="rotate(-15)"
                cursor="pointer"
              >
                {key}
                <title>{key}</title>
              </text>
              {wrapper(list).map((d) => (
                <rect
                  key={d.key}
                  y={y(d.key)}
                  height={y.bandwidth() - 2}
                  width={cellWidth - 2}
                  fill={rectColor(d, key)}
                ></rect>
              ))}
            </g>
          ))}
        </g>
      </Svg>
    </Chart>
  );
}
