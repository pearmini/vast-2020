import React, { useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useCSV from "../../../hooks/use-csv";
import { OriginalEdge, OriginalEdgeType, nameUrlMap } from "../../../data";
import * as d3 from "d3";
import _ from "lodash";
import { Spin } from "antd";
import { useResizeObserver } from "beautiful-react-hooks";

// Since antd pollute the color, we must reset it.
const Container = styled.div`
  width: 100%;
  color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface ActivityRecord {
  /**
   * The unique index of this record.
   */
  id: number;
  /**
   * The type of the record, in string.
   */
  type: string;
  /**
   * The index of the related person.
   */
  person: number;
  /**
   * The time of this activity, in ms.
   */
  time: number;
  /**
   * If this activity involves two person, this will be the index of the other
   * person's corresponding activity record.
   */
  counterpart: number | null;
  /**
   * The order of this person.
   */
  order: number;
}

/**
 * According to the README, all time values are offset to Jan 1st, 2025.
 */
const DATASET_EPOCH = new Date(2025, 0, 1, 0, 0, 0);

/**
 * Transform edges to activity records.
 * @param edges edges from original edges
 */
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
const DEFAULT_RADIUS = 3;
const HIGHLIGHT_RADIUS = 5;

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
  const containerRect = useResizeObserver(
    containerRef as React.MutableRefObject<HTMLElement>
  );

  useEffect(() => {
    if (containerRef.current === null || records === undefined) {
      return;
    }
    chart(containerRef.current, records, containerRect?.width, margin);
  }, [records, margin, containerRect]);

  return (
    <Container ref={containerRef}>
      {records === undefined ? <Spin tip="Loading..." /> : null}
    </Container>
  );
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

function chart(
  containerElement: HTMLDivElement,
  records: ActivityRecord[],
  predefinedWidth: number | undefined,
  margin: { left: number; right: number; top: number; bottom: number }
): void {
  // const width =
  // predefinedWidth ?? containerElement.getBoundingClientRect().width;
  const width = 600;
  const height = 500;
  const container = d3.select(containerElement);
  container.selectAll("svg").remove();
  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  // .attr("width", width)
  // .attr("height", height);
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
            .each((d) =>
              counterparts.set(d.person, 1 + (counterparts.get(d.person) ?? 0))
            );
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
            .attr("y", (d) => scaleY((d[0] as unknown) as string)!)
            .attr("width", width - margin.left - margin.right)
            .attr("height", 2 * DEFAULT_RADIUS + 1)
            .attr("transform", "translate(0, -4)")
            .attr("fill", (d) => (d[0] === person ? "black" : "red"))
            .attr("opacity", (d) =>
              d[0] === person ? 0.1 : scaleOpacity(d[1])
            );
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
    .attr("r", DEFAULT_RADIUS)
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

  const FONT_SIZE = 12;
  const lineHeight = 16;

  const legendPosition = [margin.left + 16, margin.top + 16];
  const legendPadding = [12, 8];
  const legendBackground = svg
    .append("rect")
    .attr("fill", "#ffffff")
    .attr("stroke", "#000000")
    .attr("stroke-width", 1)
    .attr("opacity", 0.5)
    .attr(
      "transform",
      `translate(${legendPosition[0] - legendPadding[0] / 2}, ${
        legendPosition[1] - legendPadding[1] / 2
      })`
    );

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${legendPosition[0] + DEFAULT_RADIUS}, ${legendPosition[1]})`
    );

  legend
    .selectAll("g")
    .data(scaleColor.domain())
    .enter()
    .append("g")
    .each(function (d, i) {
      const h = d3
        .select(this)
        .attr("transform", `translate(0, ${i * lineHeight})`);
      h.append("circle")
        .attr("r", DEFAULT_RADIUS)
        .attr("cy", lineHeight / 2)
        .attr("fill", scaleColor(d));
      const label = h
        .append("text")
        .attr("x", 2 * DEFAULT_RADIUS + 4)
        .attr("font-size", FONT_SIZE)
        .attr("dominant-baseline", "middle")
        .text(d);
      label.attr(
        "y",
        (label.node()?.getBoundingClientRect().height ?? lineHeight) / 2
      );
    });

  const legendBounds = legend.node()?.getBoundingClientRect();
  if (legendBounds) {
    console.log(legendBounds);
    legendBackground.attr("width", legendBounds.width * 1.2 + legendPadding[0]);
    legendBackground.attr(
      "height",
      legendBounds.height * 1.2 + legendPadding[1]
    );
  }

  /**
   * Highlight given marks.
   * @param marks the marks to be highlighted
   */
  function highlight(
    marks: d3.Selection<SVGCircleElement, any, any, any>
  ): typeof marks {
    return marks
      .attr("opacity", HIGHLIGHT_OPACITY)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("r", HIGHLIGHT_RADIUS);
  }

  /**
   * Restore given marks to the original status.
   * @param marks the marks to be restored
   */
  function restore(
    marks: d3.Selection<SVGCircleElement, any, any, any>
  ): typeof marks {
    return marks
      .attr("opacity", DEFAULT_OPACITY)
      .attr("stroke", "none")
      .attr("stroke-width", null)
      .attr("r", DEFAULT_RADIUS);
  }

  /**
   * Create a link from the given activity record
   * @param from the origin activity record
   */
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
      .attr("y1", y1 < y2 ? y1 + HIGHLIGHT_RADIUS : y1 - HIGHLIGHT_RADIUS)
      .attr("x2", scaleX(counterpart.time))
      .attr("y2", y1 < y2 ? y2 - HIGHLIGHT_RADIUS : y2 + HIGHLIGHT_RADIUS)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5)
      .attr("fill", "white");
  }
}
