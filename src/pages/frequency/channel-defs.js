export const channels = [
  {
    channel: 1,
    description: 'Phone',
    nodeTypes: [1],
    edgeTypes: [0],
    directed: true,
    bipartite: false,
    temporal: true
  },
  {
    channel: 2,
    description: 'Email',
    nodeTypes: [1],
    edgeTypes: [1],
    directed: true,
    bipartite: false,
    temporal: true
  },
  {
    channel: 3,
    description: 'Procurement',
    nodeTypes: [1, 2],
    edgeTypes: [2, 3],
    directed: true,
    bipartite: true,
    temporal: true
  },
  {
    channel: 4,
    description: 'Co-authorshop',
    nodeTypes: [1, 3],
    edgeTypes: [4],
    directed: true,
    bipartite: true,
    temporal: true
  },
  {
    channel: 5,
    description: 'Demographics',
    nodeTypes: [1, 4],
    edgeTypes: [5],
    directed: true,
    bipartite: true,
    temporal: false
  },
  {
    channel: 6,
    description: 'Travel',
    nodeTypes: [1, 5],
    edgeTypes: [6],
    directed: true,
    bipartite: true,
    temporal: true
  }
];

export const typeChannelMap = new Map(
  channels.flatMap(x => x.edgeTypes.map(y => [y, x]))
 );
