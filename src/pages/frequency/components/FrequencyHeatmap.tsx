import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { VegaLite } from "react-vega";
import { TopLevelSpec as VegaLiteSpec } from 'vega-lite';
import useCSV from "../../../hooks/use-csv";
import { nameUrlMap } from "../../../data";

enum OriginalEdgeType {
  Phone = 0,
  Email = 1,
  Sell = 2,
  Buy = 3,
  Author = 4,
  Finance = 5,
  Travel = 6,
}

interface OriginalEdge {
  Source: number;
  eType: OriginalEdgeType;
  Target: number;
  Time: number;
  Weight: number;
  SourceLocation?: number;
  TargetLocation?: number;
  SourceLatitude?: number;
  SourceLongitude?: number;
  TargetLatitude?: number;
  TargetLongitude?: number;
}

interface ActivityRecord {
  id: number;
  type: string;
  person: number;
  time: number;
  counterpart: number | null;
  order: number;
}

function preprocess(edges: OriginalEdge[]): ActivityRecord[] {
  const records: ActivityRecord[] = [];
  const personOrderMap = new Map<number, number>();
  let minTime = Number.POSITIVE_INFINITY;
  for (const { eType, Source: source, Target: target, Time: time } of edges) {
    if (eType === OriginalEdgeType.Author || eType === OriginalEdgeType.Finance) {
      continue;
    }
    if (time < minTime) {
      minTime = time;
    }
    const type = OriginalEdgeType[eType];
    records.push({ id: records.length, type, person: source, time, counterpart: null, order: 0 });
    personOrderMap.set(source, (personOrderMap.get(source) ?? 0) + 1);
    if (eType === OriginalEdgeType.Phone || eType === OriginalEdgeType.Email) {
      records.push({ id: records.length, type, person: target, time, counterpart: null, order: 0 });
      personOrderMap.set(target, (personOrderMap.get(target) ?? 0) + 1);
      records[records.length - 1].counterpart = records[records.length - 2].id;
      records[records.length - 2].counterpart = records[records.length - 1].id;
    }
  }
  for (const record of records) {
    record.time -= minTime;
    record.order = personOrderMap.get(record.person) ?? 0;
  }
  return records;
}

export type FrequencyHeatmapProps = { name: string };

const spec: VegaLiteSpec = {
  data: { name: 'cooked' },
  mark: { type: 'circle', size: 48 },
  selection: { type: { type: 'multi', fields: ['type'], bind: 'legend' } },
  encoding: {
    x: { type: 'quantitative', field: 'time' },
    y: { type: 'nominal', field: 'person', sort: { field: 'order', order: 'descending'} },
    color: { type: 'nominal', field: 'type' },
    opacity: { value: 0.1, condition: { selection: 'type', value: 0.9 } },
  },
};

const FrequencyHeatmap: React.FC<FrequencyHeatmapProps> = ({ name }) => {
  const { data } = useCSV<OriginalEdge[]>(nameUrlMap[name]);
  const cooked = useMemo(() => data === undefined ? undefined : preprocess(data), [data])
  return cooked === undefined ? null : <VegaLite spec={spec} data={{ cooked }} />;
};

FrequencyHeatmap.propTypes = {
  name: PropTypes.string.isRequired,
};

export default FrequencyHeatmap;
