import React from "react";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import "array-flat-polyfill";

const d3 = {
  ...d3All,
  ...d3Array,
};

export default function ({
  d,
  timeRange,
  edges,
  fields,
  togglePersonnel,
  selectedPersonnel,
  color,
  highlightPersonnel,
  size,
}) {
  const HIGHLIGHT_COLOR = "red";
  const NORMAL_COLOR = "currentColor";
  const DISABLE_COLOR = "grey";
  const [width, height] = size;
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

  const leftNodes = nodes.filter((d) => d.x - width / 2 < 0);
  const rightNodes = nodes.filter((d) => d.x - width / 2 > 0);
  const labelHeight = 15;
  const pathLink = d3
    .linkHorizontal()
    .x((d) => d.x)
    .y((d) => d.y);

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
      style={{ width: "100%", height: "100%", background: "#fff" }}
    >
      <text transform={`translate(${width / 2}, 30)`} textAnchor="middle">
        {key}
      </text>
      {nodes.length === 0 ? (
        <text
          transform={`translate(${width / 2}, ${height / 2})`}
          dy="0.33em"
          textAnchor="middle"
          fill="#aaa"
          fontSize="20"
        >
          no nodes
        </text>
      ) : (
        <>
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

          {leftNodes.map((d, index) => (
            <path
              key={d.id}
              stroke="#ddd"
              strokeWidth={1}
              fill="none"
              d={pathLink({
                source: {
                  x: 40,
                  y:
                    index * labelHeight +
                    (height - leftNodes.length * labelHeight) / 2,
                },
                target: {
                  x: d.x,
                  y: d.y,
                },
              })}
            ></path>
          ))}
          {rightNodes.map((d, index) => (
            <path
              key={d.id}
              stroke="#ddd"
              strokeWidth={1}
              fill="none"
              d={pathLink({
                source: {
                  x: width - 40,
                  y:
                    index * labelHeight +
                    (height - rightNodes.length * labelHeight) / 2,
                },
                target: {
                  x: d.x,
                  y: d.y,
                },
              })}
            ></path>
          ))}
          {rightNodes.map((d, index) => (
            <text
              key={d.id}
              x={width - 30}
              y={
                index * labelHeight +
                (height - rightNodes.length * labelHeight) / 2
              }
              fontSize="10"
              fill="black"
              fontWeight="bold"
              cursor="pointer"
              textAnchor="end"
              onClick={() => togglePersonnel("" + d.id)}
            >
              {d.id}
            </text>
          ))}
          {leftNodes.map((d, index) => (
            <text
              key={d.id}
              x={30}
              y={
                index * labelHeight +
                (height - leftNodes.length * labelHeight) / 2
              }
              fontSize="10"
              fill="black"
              fontWeight="bold"
              cursor="pointer"
              textAnchor="start"
              onClick={() => togglePersonnel("" + d.id)}
            >
              {d.id}
            </text>
          ))}
          {nodes.map((d) => (
            <circle
              key={d.id}
              r={4}
              cx={d.x}
              cy={d.y}
              cursor="pointer"
              onClick={() => togglePersonnel("" + d.id)}
              fill={circleColorScale(d.id)}
            >
              <title>{d.id}</title>
            </circle>
          ))}
        </>
      )}
    </svg>
  );
}
