import React from "react";
import * as d3All from "d3";
import * as d3Array from "d3-array";

const d3 = {
  ...d3All,
  ...d3Array,
};

export default function ({
  d,
  timeRange,
  edges,
  fields,
  set,
  selectedPersonnel,
  color,
  highlightPersonnel,
}) {
  const HIGHLIGHT_COLOR = "red";
  const NORMAL_COLOR = "black";
  const DISABLE_COLOR = "grey";
  const width = 600 * 0.9,
    height = 400 * 0.9,
    margin = { top: 10, right: 60, bottom: 30, left: 30 };
  const { key, data } = d;
  const [start, end] = timeRange;
  const edgeSet = new Set(edges);
  const validData = data.filter(
    (d) => d.Time >= start && d.Time < end && edgeSet.has(d.eType)
  );
  const { links, nodes } = getGraphData(validData);

  const circleColorScale = (id) => {
    if (highlightPersonnel !== -1) {
      return +highlightPersonnel === id ? HIGHLIGHT_COLOR : DISABLE_COLOR;
    } else {
      const item = selectedPersonnel.find((d) => +d === id);
      return item === undefined ? NORMAL_COLOR : HIGHLIGHT_COLOR;
    }
  };

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
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

  return (
    <svg
      viewBox={[0, 0, width, height]}
      style={{ width: "100%", height: "100%" }}
    >
      <text
        transform={`translate(${width / 2}, 20)`}
        textAnchor="middle"
        fontSize="20"
      >
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
          stroke={color(fields.find((f) => f.value === d.eType).name)}
        />
      ))}
      {nodes.map((d) => (
        <circle
          key={d.id}
          r={5}
          cx={d.x}
          cy={d.y}
          cursor="pointer"
          onClick={() => {
            const i = selectedPersonnel.indexOf("" + d.id);
            const newSelectedPersonnel = [...selectedPersonnel];
            if (i === -1) {
              newSelectedPersonnel.push("" + d.id);
            } else {
              newSelectedPersonnel.splice(i, 1);
            }
            set("selectedPersonnel", newSelectedPersonnel);
          }}
          fill={circleColorScale(d.id)}
        >
          <title>{d.id}</title>
        </circle>
      ))}
      {/* <g transform={`translate(${width - margin.right}, ${margin.top})`}>
        {edges.map((key, index) => (
          <g key={key} transform={`translate(0, ${index * 20})`}>
            <rect
              fill={color(fields.find((d) => d.value === key).name)}
              width={10}
              height={10}
              x={-15}
              y={-10}
            ></rect>
            <text>{fields.find((d) => d.value === key).name}</text>
          </g>
        ))}
      </g> */}
    </svg>
  );
}