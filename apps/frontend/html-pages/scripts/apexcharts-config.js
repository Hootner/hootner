/**
 * ApexCharts Configuration for Dashboard
 */

/* global ApexCharts */

const ApexChartsConfig = {
  areaChart(selector, data) {
    try {
      if (!selector || !data || !Array.isArray(data)) {
        throw new Error('Invalid selector or data provided');
      }
      
      if (typeof ApexCharts === 'undefined') {
        throw new Error('ApexCharts library not loaded');
      }
      
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const options = {
        series: [{ name: 'Metrics', data: data }],
        chart: { type: 'area', height: 300, background: 'transparent', foreColor: '#00ff00' },
        stroke: { curve: 'smooth', colors: ['#00ff00'] },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        xaxis: { type: 'datetime', labels: { style: { colors: '#00ffff' } } },
        yaxis: { labels: { style: { colors: '#00ffff' } } },
        theme: { mode: 'dark' }
      };
      
      const chart = new ApexCharts(element, options);
      chart.render();
      return chart;
    } catch (error) {
      console.error('Area chart creation error:', error);
      return null;
    }
  },

  radialBar(selector, value, label) {
    try {
      if (!selector || typeof value !== 'number' || !label) {
        throw new Error('Invalid parameters provided');
      }
      
      if (typeof ApexCharts === 'undefined') {
        throw new Error('ApexCharts library not loaded');
      }
      
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const options = {
        series: [value],
        chart: { type: 'radialBar', height: 250, background: 'transparent' },
        plotOptions: {
          radialBar: {
            hollow: { size: '60%' },
            dataLabels: {
              name: { color: '#00ffff' },
              value: { color: '#00ff00', fontSize: '24px' }
            }
          }
        },
        labels: [label],
        colors: ['#00ff00']
      };
      
      const chart = new ApexCharts(element, options);
      chart.render();
      return chart;
    } catch (error) {
      console.error('Radial bar chart creation error:', error);
      return null;
    }
  },

  heatmap(selector, data) {
    try {
      if (!selector || !data || !Array.isArray(data)) {
        throw new Error('Invalid selector or data provided');
      }
      
      if (typeof ApexCharts === 'undefined') {
        throw new Error('ApexCharts library not loaded');
      }
      
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const options = {
        series: data,
        chart: { type: 'heatmap', height: 350, background: 'transparent' },
        dataLabels: { enabled: false },
        colors: ['#00ff00']
      };
      
      const chart = new ApexCharts(element, options);
      chart.render();
      return chart;
    } catch (error) {
      console.error('Heatmap chart creation error:', error);
      return null;
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApexChartsConfig;
}
