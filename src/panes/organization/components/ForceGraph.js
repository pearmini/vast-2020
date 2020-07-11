import React from "react";
import * as d3All from "d3";
import * as d3Array from "d3-array";

const d3 = {
  ...d3All,
  ...d3Array,
};

export default function ({ d, timeRange, edges, fields }) {
  const width = 600,
    height = 400,
    margin = { top: 10, right: 60, bottom: 30, left: 30 },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;
  const { key, data } = d;
  const [start, end] = timeRange;
  const edgeSet = new Set(edges);
  const validData = data.filter(
    (d) => d.Time >= start && d.Time < end && edgeSet.has(d.eType)
  );
  const { links, nodes } = getGraphData(validData);
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
    .stop();

  for (
    let i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
      );
    i < n;
    ++i
  ) {
    simulation.tick();
  }

  function getGraphData(data) {
    const nodes = Array.from(
      new Set(data.flatMap((d) => [+d.Source, +d.Target]))
    ).map((d) => ({
      id: d,
      group: 0,
    }));

    const links = data.map((d) => ({
      source: +d.Source,
      target: +d.Target,
      value: 1,
      eType: d.eType,
    }));

    const combine = (data) => {
      const links = [];
      for (let d of data) {
        const e = links.find((l) => {
          const array1 = [l.source, l.target].sort((a, b) => a - b);
          const array2 = [d.source, d.target].sort((a, b) => a - b);
          return array1[0] === array2[0] && array1[1] === array2[1];
        });
        if (e) {
          const index = links.indexOf(e);
          links[index] = { ...e, value: e.value + 1 };
        } else {
          links.push(d);
        }
      }
      return links;
    };
    return { nodes, links: combine(links) };
  }

  console.log(fields);
  const color = d3.scaleOrdinal().domain(edges).range(d3.schemeCategory10);

  return (
    <svg
      viewBox={[0, 0, width, height]}
      style={{ width: "100%", height: "100%" }}
    >
      <text transform={`translate(${width / 2}, 0)`} textAnchor="middle">
        {key}
      </text>
      {links.map((d) => (
        <line
          key={d.index}
          x1={d.source.x}
          y1={d.source.y}
          x2={d.target.x}
          y2={d.target.y}
          strokeWidth={Math.sqrt(d.value)}
          stroke={color(d.eType)}
        />
      ))}
      {nodes.map((d) => (
        <circle key={d.id} r={5} cx={d.x} cy={d.y}></circle>
      ))}
      <g transform={`translate(${width - margin.right}, ${margin.top})`}>
        {edges.map((key, index) => (
          <g key={key} transform={`translate(0, ${index * 20})`}>
            <rect
              fill={color(key)}
              width={10}
              height={10}
              x={-15}
              y={-10}
            ></rect>
            <text>{fields.find((d) => d.value === key).name}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
