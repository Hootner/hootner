/**
 * Plotly Interactive Graphs for Dashboard
 */

const PlotlyGraphs = {
  scatter3D(selector, data) {
    const trace = {
      x: data.map(d => d.x),
      y: data.map(d => d.y),
      z: data.map(d => d.z),
      mode: 'markers',
      marker: {size: 8, color: data.map(d => d.value), colorscale: 'Viridis', showscale: true},
      type: 'scatter3d'
    };
    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {color: '#00ff00'},
      scene: {xaxis: {gridcolor: '#00ffff'}, yaxis: {gridcolor: '#00ffff'}, zaxis: {gridcolor: '#00ffff'}}
    };
    Plotly.newPlot(selector, [trace], layout);
  },

  sunburst(selector, data) {
    const trace = {
      type: 'sunburst',
      labels: data.labels,
      parents: data.parents,
      values: data.values,
      marker: {colors: data.colors || ['#00ff00', '#00ffff', '#ff00ff']}
    };
    const layout = {paper_bgcolor: 'transparent', font: {color: '#00ff00'}};
    Plotly.newPlot(selector, [trace], layout);
  },

  animatedTimeSeries(selector, frames) {
    const data = [{
      x: frames[0].x,
      y: frames[0].y,
      mode: 'lines+markers',
      line: {color: '#00ff00'},
      marker: {color: '#00ffff'}
    }];
    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {color: '#00ff00'},
      updatemenus: [{type: 'buttons', buttons: [{label: 'Play', method: 'animate', args: [null, {frame: {duration: 500}}]}]}]
    };
    Plotly.newPlot(selector, data, layout, {frames: frames});
  }
};
