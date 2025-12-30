/**
 * ApexCharts configurations
 */

function createAreaChart(chartId, series) {
  new ApexCharts(document.querySelector(chartId), {
    chart: { type: 'area', height: 350 },
    series: series,
    xaxis: { type: 'category' },
    colors: ['#00ff00', '#00ffff'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9 } },
    theme: { mode: 'dark' }
  }).render();
}

function createRadialBarChart(chartId, series) {
  new ApexCharts(document.querySelector(chartId), {
    chart: { type: 'radialBar', height: 350 },
    series: series,
    plotOptions: { radialBar: { hollow: { size: '70%' } } },
    labels: ['Progress'],
    colors: ['#00ff00', '#00ffff'],
    theme: { mode: 'dark' }
  }).render();
}

function createHeatmapChart(chartId, series) {
  new ApexCharts(document.querySelector(chartId), {
    chart: { type: 'heatmap', height: 350 },
    series: series,
    plotOptions: { heatmap: { colorScale: { ranges: [{ from: 0, to: 50, color: '#00ffff' }, { from: 51, to: 100, color: '#00ff00' }] } } },
    theme: { mode: 'dark' }
  }).render();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createAreaChart, createRadialBarChart, createHeatmapChart };
}
