import React, { useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useCSV from "../../../hooks/use-csv";
import { OriginalEdge, OriginalEdgeType, nameUrlMap } from "../../../data";
import * as d3 from "d3";
import _ from "lodash";

const Container = styled.div`
  color: black;
`;

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

const DEFAULT_OPACITY = 0.2;
const HIGHLIGHT_OPACITY = 0.8;

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
    const width = 1200;
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
    const allPersons = _.uniq(
      records.map((x) => (x.person as unknown) as string)
    );
    const scaleY = d3
      .scalePoint()
      .domain(allPersons)
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
      )
      .call((g) => g.selectAll(".tick text").attr("cursor", "pointer"))
      .call((g) =>
        g
          .selectAll<SVGTextElement, number>(".tick text")
          .on("mouseenter", function (person) {
            const counterparts = new Map<number, number>();
            circles
              .filter(
                (x) =>
                  x.person === person ||
                  (x.counterpart !== null &&
                    records[x.counterpart].person === person)
              )
              .call(highlight)
              // Collect all counterparts.
              .each((d) => counterparts.set(d.person, 1 + (counterparts.get(d.person) ?? 0)));
            records.filter((x) => x.person === person).forEach(link);
            // A person cannot be his/her counterpart.
            counterparts.delete(person);
            const frequencies = [...counterparts.values()];
            const scaleOpacity = d3
              .scaleLinear()
              .domain(d3.extent(frequencies) as [number, number])
              .range([0.1, 0.3]);
            bands
              .selectAll("rect")
              .data([...counterparts, [person, 0]])
              .enter()
              .append("rect")
              .attr("x", margin.left)
              .attr("y", (d) => scaleY(d[0] as unknown as string)!)
              .attr("width", width - margin.left - margin.right)
              .attr("height", 2 * 4 + 1)
              .attr("transform", "translate(0, -4)")
              .attr("fill", (d) => d[0] === person ? "black" : "red")
              .attr("opacity", (d) => d[0] === person ? 0.1 : scaleOpacity(d[1]));
          })
          .on("mouseleave", function (person) {
            circles
              .filter(
                (x) =>
                  x.person === person ||
                  (x.counterpart !== null &&
                    records[x.counterpart].person === person)
              )
              .call(restore);
            links.selectAll("line").remove();
            bands.selectAll("rect").remove();
          })
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

    const bands = svg.append("g").attr("class", "bands");

    const circles = svg
      .append("g")
      .selectAll("circle")
      .data(records)
      .enter()
      .append("circle")
      .attr("cx", (d) => scaleX(d.time))
      .attr("cy", (d) => scaleY((d.person as unknown) as string)!)
      .attr("r", 4)
      .attr("opacity", DEFAULT_OPACITY)
      .attr("fill", (d) => scaleColor(d.type))
      .on("mouseenter", function (d) {
        d3.select(this).call(highlight);
        if (d.counterpart !== null) {
          circles.filter((x) => x.id === d.counterpart).call(highlight);
          link(d);
        }
      })
      .on("mouseleave", function (d) {
        d3.select(this).call(restore);
        if (d.counterpart !== null) {
          circles.filter((x) => x.id === d.counterpart).call(restore);
          links.selectAll("line").remove();
        }
      });

    const links = svg.append("g").attr("class", "links");

    function highlight(
      marks: d3.Selection<SVGCircleElement, any, any, any>
    ): typeof marks {
      return marks
        .attr("opacity", HIGHLIGHT_OPACITY)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("r", 2);
    }

    function restore(
      marks: d3.Selection<SVGCircleElement, any, any, any>
    ): typeof marks {
      return marks
        .attr("opacity", DEFAULT_OPACITY)
        .attr("stroke", "none")
        .attr("stroke-width", null)
        .attr("r", 4);
    }

    function link(from: ActivityRecord): void {
      if (records === undefined || from.counterpart === null) {
        return;
      }
      const counterpart = records[from.counterpart];
      const y1 = scaleY((from.person as unknown) as string)!;
      const y2 = scaleY((counterpart.person as unknown) as string)!;
      links
        .append("line")
        .attr("x1", scaleX(from.time))
        .attr("y1", y1 < y2 ? y1 + 2 : y1 - 2)
        .attr("x2", scaleX(counterpart.time))
        .attr("y2", y1 < y2 ? y2 - 2 : y2 + 2)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.5)
        .attr("fill", "white");
    }
  }, [records, margin]);

  return <Container ref={containerRef} />;
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
