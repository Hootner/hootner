/**
 * Plotly graph implementations
 */

function create3DScatter(divId, data) {
  data.marker = { ...data.marker, color: data.marker.color || '#00ff00', size: 5 };
  Plotly.newPlot(divId, [data], {
    scene: { xaxis: { backgroundcolor: 'rgb(20,20,20)' }, yaxis: { backgroundcolor: 'rgb(20,20,20)' }, zaxis: { backgroundcolor: 'rgb(20,20,20)' } },
    margin: { l: 0, r: 0, b: 0, t: 0 },
    paper_bgcolor: 'rgb(0,0,0)',
    font: { color: '#00ffff' }
  });
}

function createSunburst(divId, data) {
  Plotly.newPlot(divId, [{
    type: 'sunburst',
    labels: data.labels,
    parents: data.parents,
    values: data.values,
    outsidetextfont: { size: 20, color: '#00ffff' },
    leaf: { opacity: 0.4 },
    marker: { line: { width: 2 }, colors: ['#00ff00', '#00ffff'] }
  }], {
    margin: { l: 0, r: 0, b: 0, t: 0 },
    paper_bgcolor: 'rgb(0,0,0)'
  });
}

function createAnimatedTimeSeries(divId, data, frames) {
  Plotly.newPlot(divId, data, {
    updatemenus: [{ buttons: [{ args: [null, { frame: { duration: 500, redraw: true }, fromcurrent: true }], label: 'Play', method: 'animate' }] }],
    paper_bgcolor: 'rgb(0,0,0)',
    font: { color: '#00ffff' }
  }).then(() => Plotly.addFrames(divId, frames));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { create3DScatter, createSunburst, createAnimatedTimeSeries };
}
