import React, { useEffect } from "react";
import styled from "styled-components";
import * as d3 from "d3";

const Container = styled.svg`
  background: white;
  width: 100%;
  height: 100%;
`;

export default function ({ data, name, color }) {
  const width = 600 * 0.9,
    height = 400 * 0.9,
    margin = { top: 10, right: 20, bottom: 30, left: 30 };

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  useEffect(() => {
    const xAxis = (g) =>
      g.attr("transform", `translate(${0},${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 90)
          .tickSizeOuter(0)
      );

    const yAxis = (g) =>
      g
        .attr("transform", `translate(${margin.left},${0})`)
        .call(d3.axisLeft(y))
        .call((g) => g.select(".domain").remove());

    d3.select(`.x-axis-${name}-bar`).call(xAxis);
    d3.select(`.y-axis-${name}-bar`).call(yAxis);
  });

  return (
    <Container viewBox={[0, 0, width, height]}>
      {data.map((d) => (
        <rect
          x={x(d.name)}
          y={y(d.count)}
          height={y(0) - y(d.count)}
          width={x.bandwidth()}
          fill={color(d.name)}
        ></rect>
      ))}
      <g className={`x-axis-${name}-bar`} />
      <g className={`y-axis-${name}-bar`} />
    </Container>
  );
}
