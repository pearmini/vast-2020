import template from "../data/template.csv";
import g1 from "../data/g1.csv";
import g2 from "../data/g2.csv";
import g3 from "../data/g3.csv";
import g4 from "../data/g4.csv";
import g5 from "../data/g5.csv";

export enum OriginalEdgeType {
  Phone = 0,
  Email = 1,
  Sell = 2,
  Buy = 3,
  Author = 4,
  Finance = 5,
  Travel = 6,
}

export interface OriginalEdge {
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

export const nameUrlMap: Record<string, string> = { template, g1, g2, g3, g4, g5 };
