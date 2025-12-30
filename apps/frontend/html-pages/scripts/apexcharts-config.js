/**
 * ApexCharts Configuration for Dashboard
 */

const ApexChartsConfig = {
  areaChart(selector, data) {
    const options = {
      series: [{name: 'Metrics', data: data}],
      chart: {type: 'area', height: 300, background: 'transparent', foreColor: '#00ff00'},
      stroke: {curve: 'smooth', colors: ['#00ff00']},
      fill: {type: 'gradient', gradient: {shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3}},
      xaxis: {type: 'datetime', labels: {style: {colors: '#00ffff'}}},
      yaxis: {labels: {style: {colors: '#00ffff'}}},
      theme: {mode: 'dark'}
    };
    const chart = new ApexCharts(document.querySelector(selector), options);
    chart.render();
    return chart;
  },

  radialBar(selector, value, label) {
    const options = {
      series: [value],
      chart: {type: 'radialBar', height: 250, background: 'transparent'},
      plotOptions: {radialBar: {hollow: {size: '60%'}, dataLabels: {name: {color: '#00ffff'}, value: {color: '#00ff00', fontSize: '24px'}}}},
      labels: [label],
      colors: ['#00ff00']
    };
    const chart = new ApexCharts(document.querySelector(selector), options);
    chart.render();
    return chart;
  },

  heatmap(selector, data) {
    const options = {
      series: data,
      chart: {type: 'heatmap', height: 350, background: 'transparent'},
      dataLabels: {enabled: false},
      colors: ['#00ff00']
    };
    const chart = new ApexCharts(document.querySelector(selector), options);
    chart.render();
    return chart;
  }
};
