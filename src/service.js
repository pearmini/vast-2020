import template from "./data/template.csv";
import g1 from "./data/g1.csv";
import g2 from "./data/g2.csv";
import g3 from "./data/g3.csv";
import g4 from "./data/g4.csv";
import g5 from "./data/g5.csv";
import final from "./data/final.csv";
import dc from "./data/dc.csv";

import { csv } from "d3";

export const queryEdge = (value) => {
  return new Promise((resolve) => {
    const data = [
      {
        Source: "599956",
        eType: 1,
        Target: "635665",
        Time: 1423376,
        Weight: "1",
        SourceLocation: 0,
        TargetLocation: 0,
        SourceLatitude: 34.2958,
        SourceLongitude: -39.026,
        TargetLatitude: 29.3296,
        TargetLongitude: -37.8076,
      },
    ];
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
};

export const readGraphCSV = () => {
  const filelist = [
    { name: "template", url: template },
    { name: "g1", url: g1 },
    { name: "g2", url: g2 },
    { name: "g3", url: g3 },
    { name: "g4", url: g4 },
    { name: "g5", url: g5 },
    { name: "candidate", url: final },
  ];
  return Promise.all(filelist.map((d) => csv(d.url))).then((data) =>
    Promise.resolve(
      data.map((d, index) => ({
        data: d,
        key: filelist[index].name,
      }))
    )
  );
};

export const readDcCSV = () => {
  return csv(dc);
};
