import React, { useEffect } from "react";
import * as d3All from "d3";
import * as d3Array from "d3-array";

const d3 = {
  ...d3All,
  ...d3Array,
};

export default function ({ data, timeRange, selectedGraphs, color, size }) {
  const [width, height] = size,
    margin = { top: 30, right: 20, bottom: 30, left: 40 },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;
  const { name, list } = data;
  const [start, end] = timeRange;
  const dates = d3.timeDay
    .range(new Date(start * 1000), new Date(end * 1000))
    .map((d) => [format(d), 0]);
  const graphSet = new Set(selectedGraphs);
  const validList = list.filter(
    ({ Time, key }) => Time >= start && Time <= end && graphSet.has(key)
  );
  const { dateList, countRange = [0, 0] } = aggregate(validList);

  const x = d3
    .scaleTime()
    .domain([new Date(start * 1000), new Date(end * 1000)])
    .range([0, innerWidth]);

  const y = d3.scaleLinear().domain(countRange).nice().range([innerHeight, 0]);

  const line = d3
    .line()
    .defined((d) => !isNaN(d[1]))
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  function aggregate(list) {
    let maxCount = -1;
    return {
      dateList: d3
        .groups(list, (d) => d.key)
        .map(([key, data]) => [key, sum(data)]),
      countRange: [0, maxCount],
    };
    function sum(data) {
      const datevalues = new Map(dates);
      for (let d of data) {
        const { Time } = d;
        const date = format(new Date(Time * 1000));
        const count = datevalues.get(date) || 0;
        datevalues.set(date, count + 1);
        maxCount = Math.max(count + 1, maxCount);
      }
      return Array.from(datevalues)
        .map(([date, count]) => [new Date(date), count])
        .sort((a, b) => b[0] - a[0]);
    }
  }

  function format(date) {
    const wrapper = (d) => (d < 10 ? "0" + d : d);
    return `${date.getFullYear()}-${wrapper(date.getMonth() + 1)}-${wrapper(
      date.getDate()
    )}`;
  }

  useEffect(() => {
    const xAxis = (g) =>
      g
        .attr(
          "transform",
          `translate(${margin.left},${height - margin.bottom})`
        )
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 90)
            .tickSizeOuter(0)
        );

    const yAxis = (g) =>
      g
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(y))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y)
        );

    d3.select(`.${name}-x-axis`).call(xAxis);
    d3.select(`.${name}-y-axis`).call(yAxis);
  });

  return (
    <svg
      viewBox={[0, 0, width, height]}
      style={{ width: "100%", height: "100%", background: "#fff" }}
    >
      <text transform={`translate(${width / 2}, 25)`} textAnchor="middle">
        {name}
      </text>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {dateList.map(([key, data]) => (
          <path
            d={line(data)}
            stroke={color(key)}
            strokeWidth={1.5}
            fill="none"
            key={key}
          />
        ))}
      </g>
      <g className={`${name}-x-axis`} />
      <g className={`${name}-y-axis`} />
      {/* <g transform={`translate(${width - margin.right}, ${margin.top})`}>
        {selectedGraphs.map((key, index) => (
          <g key={key} transform={`translate(0, ${index * 20})`}>
            <rect
              fill={color(key)}
              width={10}
              height={10}
              x={-15}
              y={-10}
            ></rect>
            <text>{key}</text>
          </g>
        ))}
      </g> */}
    </svg>
  );
}
