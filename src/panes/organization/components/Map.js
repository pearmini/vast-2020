import React, { useEffect } from "react";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import styled from "styled-components";

const d3 = {
  ...d3All,
  ...d3Array,
};

const Container = styled.svg`
  background: #fff;
  width: 100%;
  height: 100%;
`;

export default function ({ location, connectionData, color, fields, size }) {
  const minX = d3.min(location, (d) => d.minX - d.r),
    maxX = d3.max(location, (d) => d.maxX + d.r),
    minY = d3.min(location, (d) => d.minY - d.r),
    maxY = d3.max(location, (d) => d.maxY + d.r);

  const innerWidth = maxX - minX,
    innerHeight = maxY - minY,
    margin = { top: 50, right: 20, bottom: 40, left: 30 },
    width = innerWidth + margin.left + margin.right || 0,
    height = innerHeight + margin.top + margin.bottom || 0;

  const { key, data: list } = connectionData;

  const circles = location.map((d) => ({
    key: d.key,
    x: d.x - minX,
    y: d.y - minY,
    r: d.r,
  }));

  const { nodes, links } = layout(list);

  const r = d3
    .scaleLinear()
    .domain(d3.extent(nodes, (d) => d.value))
    .range([2, 20]);

  function layout(data) {
    const nodes = [],
      links = [];

    const merge = (list) => {
      const newList = [];
      const valueList = [];
      list.forEach((d) => {
        const old = newList.find(
          (l) => JSON.stringify(l) === JSON.stringify(d)
        );
        if (old) {
          const index = newList.indexOf(old);
          valueList[index]++;
        } else {
          newList.push({ ...d });
          valueList.push(1);
        }
      });

      return newList.map((d, index) => ({
        ...d,
        value: valueList[index],
      }));
    };

    for (let d of data) {
      const sourceLocation = location.find((l) => +l.key === +d.SourceLocation);
      const targetLocation = location.find((l) => +l.key === +d.TargetLocation);
      const source = {
        id: +d.Source,
        x: (d.SourceLatitude ? d.SourceLatitude : sourceLocation.x) - minX,
        y: (d.SourceLongitude ? d.SourceLongitude : sourceLocation.y) - minY,
      };
      const target = {
        id: +d.Source,
        x: (d.TargetLatitude ? d.TargetLatitude : targetLocation.x) - minX,
        y: (d.TargetLongitude ? d.TargetLongitude : targetLocation.y) - minY,
      };
      const link = {
        x0: source.x,
        y0: source.y,
        x1: target.x,
        y1: target.y,
        eType: d.eType,
      };
      nodes.push(source);
      links.push(link);
    }
    return { nodes: merge(nodes), links: merge(links) };
  }

  useEffect(() => {

  })

  return (
    <Container viewBox={[0, 0, width, height]}>
      <text x={width / 2} y={margin.top - 10} textAnchor="middle">
        {key}
      </text>
      <g className={`${key}-x-axis-graph`} />
      <g className={`${key}-y-axis-graph`} />
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {circles.map((d) => (
          <circle
            key={d.key}
            r={d.r}
            cx={d.x}
            cy={d.y}
            fill="rgba(200, 200, 200, 0.5)"
          ></circle>
        ))}
        {circles.map((d) => (
          <text key={d.key} x={d.x} y={d.y} fill="black" textAnchor="middle">
            {d.key}
          </text>
        ))}
        {nodes.map((d) => (
          <circle
            key={JSON.stringify(d)}
            r={r(d.value)}
            cx={d.x}
            cy={d.y}
            fill={`rgba(255, 0, 0, 0.2)`}
          ></circle>
        ))}
        {links.map((d) => (
          <line
            key={JSON.stringify(d)}
            x1={d.x0}
            y1={d.y0}
            x2={d.x1}
            y2={d.y1}
            strokeWidth={Math.sqrt(d.value)}
            stroke={color(fields.find((f) => f.value === d.eType).name)}
            opacity={0.5}
          ></line>
        ))}
      </g>
    </Container>
  );
}
