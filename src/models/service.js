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
