/**
 * D3.js Advanced Chart Implementations for Dashboard
 */

const D3Charts = { lineChart(selector, data) { const margin = {top: 20, right: 30, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(selector).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => d.value)]);

    svg.append('path').datum(data)
      .attr('fill', 'none').attr('stroke', '#00ff00').attr('stroke-width', 2)
      .attr('d', d3.line().x(d => x(d.date)).y(d => y(d.value)));

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y)); },

  networkGraph(selector, nodes, links) { const width = 800, height = 600;
    const svg = d3.select(selector).append('svg').attr('width', width).attr('height', height);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', '#00ffff').attr('stroke-width', 2);

    const node = svg.append('g').selectAll('circle').data(nodes).enter().append('circle')
      .attr('r', 10).attr('fill', '#00ff00');

    simulation.on('tick', () => { link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('cx', d => d.x).attr('cy', d => d.y); }); } };
