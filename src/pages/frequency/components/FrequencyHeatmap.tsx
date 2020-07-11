import React, { useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import useCSV from "../../../hooks/use-csv";
import { OriginalEdge, OriginalEdgeType, nameUrlMap } from "../../../data";
import * as d3 from "d3";
import _ from "lodash";

interface ActivityRecord {
  id: number;
  type: string;
  person: number;
  time: number;
  counterpart: number | null;
  order: number;
}

const DATASET_EPOCH = new Date(2025, 0, 1, 0, 0, 0);

function preprocess(edges: OriginalEdge[]): ActivityRecord[] {
  const records: ActivityRecord[] = [];
  const personOrderMap = new Map<number, number>();
  let minTime = Number.POSITIVE_INFINITY;
  for (const { eType, Source: source, Target: target, Time: time } of edges) {
    if (
      eType === OriginalEdgeType.Author ||
      eType === OriginalEdgeType.Finance
    ) {
      continue;
    }
    if (time < minTime) {
      minTime = time;
    }
    const type = OriginalEdgeType[eType];
    records.push({
      id: records.length,
      type,
      person: source,
      time,
      counterpart: null,
      order: 0,
    });
    personOrderMap.set(source, (personOrderMap.get(source) ?? 0) + 1);
    if (eType === OriginalEdgeType.Phone || eType === OriginalEdgeType.Email) {
      records.push({
        id: records.length,
        type,
        person: target,
        time,
        counterpart: null,
        order: 0,
      });
      personOrderMap.set(target, (personOrderMap.get(target) ?? 0) + 1);
      records[records.length - 1].counterpart = records[records.length - 2].id;
      records[records.length - 2].counterpart = records[records.length - 1].id;
    }
  }
  for (const record of records) {
    record.time = (record.time - minTime) * 1000 + DATASET_EPOCH.getTime();
    record.order = personOrderMap.get(record.person) ?? 0;
  }
  return records;
}

export type FrequencyHeatmapProps = {
  name: string;
  margin?: { left: number; right: number; top: number; bottom: number };
};

const FrequencyHeatmap: React.FC<FrequencyHeatmapProps> = ({
  name,
  margin = { left: 60, right: 30, top: 20, bottom: 30 },
}) => {
  const { data } = useCSV<OriginalEdge[]>(nameUrlMap[name]);
  const records = useMemo(
    () => (data === undefined ? undefined : preprocess(data)),
    [data]
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current === null || records === undefined) {
      return;
    }
    const width = 1000;
    const height = 400;
    const container = d3.select(containerRef.current);
    container.selectAll("svg").remove();
    const svg = container
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height);
    // const scaleX = d3
    //   .scaleLinear()
    //   .domain(d3.extent(records, (r) => r.time) as [number, number])
    //   .range([margin.left, width - margin.right])
    //   .nice();
    const scaleX = d3
      .scaleUtc()
      .domain(d3.extent(records, (r) => r.time) as [number, number])
      .range([margin.left, width - margin.right])
      .nice();
    const scaleY = d3
      .scalePoint()
      .domain(_.uniq(records.map((x) => (x.person as unknown) as string)))
      .range([height - margin.bottom, margin.top])
      .padding(1);
    const scaleColor = d3.scaleOrdinal(d3.schemeCategory10);
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(scaleY))
      .call((g) =>
        g
          .selectAll(".tick:not(:first-child) line")
          .clone()
          .attr("x2", width - margin.left - margin.right)
          .attr("color", "#ccc")
      );
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(scaleX))
      .call((g) =>
        g
          .selectAll(".tick:not(:first-child) line")
          .clone()
          .attr("y2", -(height - margin.top - margin.bottom))
          .attr("color", "#ccc")
      );
    const links = svg.append("g").attr("class", "links");
    const circles = svg
      .append("g")
      .selectAll("circle")
      .data(records)
      .enter()
      .append("circle")
      .attr("cx", (d) => scaleX(d.time))
      .attr("cy", (d) => scaleY((d.person as unknown) as string)!)
      .attr("r", 4)
      .attr("opacity", 0.4)
      .attr("fill", (d) => scaleColor(d.type))
      .on("mouseenter", function (d) {
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("r", 8);
        if (d.counterpart !== null) {
          circles
            .filter((x) => x.id === d.counterpart)
            .attr("opacity", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("r", 8);
          links
            .append("line")
            .attr("x1", scaleX(d.time))
            .attr("y1", scaleY((d.person as unknown) as string)!)
            .attr("x2", scaleX(records[d.counterpart].time))
            .attr(
              "y2",
              scaleY((records[d.counterpart].person as unknown) as string)!
            )
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "white");
        }
      })
      .on("mouseleave", function (d) {
        d3.select(this)
          .attr("opacity", 0.4)
          .attr("stroke", "none")
          .attr("stroke-width", "none")
          .attr("r", 4);
        if (d.counterpart !== null) {
          circles
            .filter((x) => x.id === d.counterpart)
            .attr("opacity", 0.4)
            .attr("stroke", "none")
            .attr("stroke-width", null)
            .attr("r", 4);
          links.selectAll("line").remove();
        }
      });
  }, [records, margin]);

  return <div ref={containerRef}></div>;
};

FrequencyHeatmap.propTypes = {
  name: PropTypes.string.isRequired,
  margin: PropTypes.shape({
    left: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
  }),
};

export default FrequencyHeatmap;
