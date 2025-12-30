/**
 * D3.js chart implementations
 */

function createLineChart(selector, data) {
  const svg = d3.select(selector).append('svg').attr('width', 600).attr('height', 400);
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().rangeRound([0, width]);
  const y = d3.scaleLinear().rangeRound([height, 0]);

  x.domain(d3.extent(data, d => d.date));
  y.domain(d3.extent(data, d => d.value));

  const line = d3.line().x(d => x(d.date)).y(d => y(d.value));

  g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).selectAll('text').attr('fill', '#00ffff');
  g.append('g').call(d3.axisLeft(y)).selectAll('text').attr('fill', '#00ffff');
  g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#00ff00').attr('stroke-width', 1.5).attr('d', line);
}

function createNetworkGraph(selector, nodes, links) {
  const svg = d3.select(selector).append('svg').attr('width', 600).attr('height', 400);

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-50))
    .force('center', d3.forceCenter(300, 200));

  const link = svg.append('g').selectAll('line').data(links).enter().append('line').attr('stroke', '#00ffff').attr('stroke-width', 1);
  const node = svg.append('g').selectAll('circle').data(nodes).enter().append('circle').attr('r', 5).attr('fill', '#00ff00');

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createLineChart, createNetworkGraph };
}
