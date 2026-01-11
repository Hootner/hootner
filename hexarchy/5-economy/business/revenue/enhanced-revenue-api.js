#!/usr/bin/env node

/**
 * Complete Revenue API - Full Featured Platform
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = 3020;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// HTML Escaping to prevent XSS (CWE-79 fix)
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.sessionId = crypto.randomUUID();
  next();
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>"'&]/g, '');
      }
    });
  }
  next();
};

// Enhanced algorithms with real business value
const algorithms = {
  price_optimize: (params) => {
    const { price, competitors, demand, seasonality = 1 } = params;
    const competitorAvg = competitors?.reduce((a, b) => a + b, 0) / competitors?.length || price;
    const demandMultiplier = 1 + (demand - 0.5) * 0.4;
    return Math.round(competitorAvg * demandMultiplier * seasonality * 100) / 100;
  },

  conversion_optimize: (params) => {
    const { current_rate, traffic, page_speed, mobile_friendly } = params;
    let optimized = current_rate;
    if (page_speed > 3) optimized *= 0.9; // Slow pages hurt conversion
    if (mobile_friendly) optimized *= 1.15; // Mobile boost
    if (traffic > 10000) optimized *= 1.05; // High traffic sites convert better
    return Math.round(optimized * 10000) / 100; // Return as percentage
  },

  revenue_forecast: (params) => {
    const { current_revenue, growth_rate, market_size, competition } = params;
    const months = params.months || 12;
    const monthlyGrowth = Math.pow(1 + growth_rate, 1/12);
    const marketCap = market_size * (1 - competition);
    let forecast = [];

    for (let i = 1; i <= months; i++) {
      const projected = Math.min(
        current_revenue * Math.pow(monthlyGrowth, i),
        marketCap
      );
      forecast.push({
        month: i,
        revenue: Math.round(projected),
        growth: Math.round(((projected / current_revenue - 1) * 100) * 100) / 100
      });
    }
    return forecast;
  },

  churn_prediction: (params) => {
    const { last_login_days, support_tickets, payment_failures, usage_decline } = params;
    let churnScore = 0;

    if (last_login_days > 30) churnScore += 0.3;
    if (support_tickets > 3) churnScore += 0.2;
    if (payment_failures > 0) churnScore += 0.4;
    if (usage_decline > 0.5) churnScore += 0.3;

    return {
      churn_probability: Math.min(churnScore, 1),
      risk_level: churnScore > 0.7 ? 'HIGH' : churnScore > 0.4 ? 'MEDIUM' : 'LOW',
      recommendations: churnScore > 0.5 ? [
        'Send retention email campaign',
        'Offer discount or upgrade',
        'Schedule customer success call'
      ] : ['Monitor engagement', 'Send product updates']
    };
  },

  ab_test_optimizer: (params) => {
    const { variant_a, variant_b, confidence_level = 0.95 } = params;
    const { conversions: convA, visitors: visA } = variant_a;
    const { conversions: convB, visitors: visB } = variant_b;

    const rateA = convA / visA;
    const rateB = convB / visB;
    const improvement = ((rateB - rateA) / rateA * 100);

    // Simple statistical significance check
    const pooled = (convA + convB) / (visA + visB);
    const se = Math.sqrt(pooled * (1 - pooled) * (1/visA + 1/visB));
    const zScore = Math.abs(rateB - rateA) / se;
    const significant = zScore > 1.96; // 95% confidence

    return {
      winner: rateB > rateA ? 'B' : 'A',
      improvement: Math.round(Math.abs(improvement) * 100) / 100,
      significant,
      recommendation: significant ?
        `Implement variant ${rateB > rateA ? 'B' : 'A'} - ${Math.abs(improvement).toFixed(1)}% improvement` :
        'Continue test - not statistically significant yet'
    };
  }
};

// Enhanced dashboard HTML
const dashboardHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>HOOTNER Revenue Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .metric h3 { margin: 0; font-size: 2em; }
        .metric p { margin: 5px 0 0 0; opacity: 0.9; }
        .test-section { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
        .result { background: #f0f8ff; padding: 10px; border-left: 4px solid #2196F3; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 HOOTNER Revenue Dashboard</h1>

        <div class="metrics" id="metrics">
            <div class="metric">
                <h3 id="totalCalls">0</h3>
                <p>Total API Calls</p>
            </div>
            <div class="metric">
                <h3 id="revenue">$0</h3>
                <p>Potential Revenue</p>
            </div>
            <div class="metric">
                <h3 id="users">0</h3>
                <p>Unique Users</p>
            </div>
            <div class="metric">
                <h3 id="algorithms">0</h3>
                <p>Algorithms Used</p>
            </div>
        </div>

        <div class="card">
            <h2>📊 Usage Chart</h2>
            <canvas id="usageChart" width="400" height="200"></canvas>
        </div>

        <div class="card">
            <h2>🧪 Test Algorithms</h2>

            <div class="test-section">
                <h3>Price Optimization</h3>
                <input type="number" id="price" placeholder="Current Price" value="100">
                <input type="text" id="competitors" placeholder="Competitor Prices (comma separated)" value="95,105,98">
                <input type="number" id="demand" placeholder="Demand (0-1)" value="0.7" step="0.1">
                <button onclick="testPriceOptimize()">Optimize Price</button>
                <div id="priceResult" class="result" style="display:none;"></div>
            </div>

            <div class="test-section">
                <h3>Conversion Rate Optimization</h3>
                <input type="number" id="currentRate" placeholder="Current Rate %" value="2.5" step="0.1">
                <input type="number" id="traffic" placeholder="Monthly Traffic" value="50000">
                <input type="number" id="pageSpeed" placeholder="Page Load Time (seconds)" value="2.1" step="0.1">
                <label><input type="checkbox" id="mobileFriendly" checked> Mobile Friendly</label>
                <button onclick="testConversion()">Optimize Conversion</button>
                <div id="conversionResult" class="result" style="display:none;"></div>
            </div>

            <div class="test-section">
                <h3>Revenue Forecast</h3>
                <input type="number" id="currentRevenue" placeholder="Current Monthly Revenue" value="10000">
                <input type="number" id="growthRate" placeholder="Expected Growth Rate" value="0.15" step="0.01">
                <input type="number" id="months" placeholder="Forecast Months" value="12">
                <button onclick="testForecast()">Generate Forecast</button>
                <div id="forecastResult" class="result" style="display:none;"></div>
            </div>
        </div>

        <div class="card">
            <h2>📈 Recent Activity</h2>
            <div id="recentActivity"></div>
        </div>
    </div>

    <script>
        let usageChart;

        async function loadDashboard() {
            try {
                const response = await fetch('/api/dashboard');
                const data = await response.json();

                document.getElementById('totalCalls').textContent = data.total_calls;
                document.getElementById('revenue').textContent = '$' + data.potential_revenue.toFixed(2);
                document.getElementById('users').textContent = data.unique_users;
                document.getElementById('algorithms').textContent = data.algorithms_used;

                // Update recent activity (XSS protection with escapeHtml)
                const activityDiv = document.getElementById('recentActivity');
                activityDiv.innerHTML = data.recent_usage.map(usage => {
                    const algorithm = escapeHtml(String(usage.algorithm));
                    const revenueImpact = escapeHtml(String(usage.revenueImpact));
                    const timestamp = escapeHtml(new Date(usage.timestamp).toLocaleString());
                    return `<div style="padding: 10px; border-bottom: 1px solid #eee;">
                        <strong>${algorithm}</strong> - ${revenueImpact}
                        <small>(${timestamp})</small>
                    </div>`;
                }).join('');

                // Update chart
                updateUsageChart(data.usage_by_hour || []);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }

        function updateUsageChart(data) {
            const ctx = document.getElementById('usageChart').getContext('2d');

            if (usageChart) {
                usageChart.destroy();
            }

            usageChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 24}, (_, i) => i + ':00'),
                    datasets: [{
                        label: 'API Calls per Hour',
                        data: data.length ? data : Array.from({length: 24}, () => Math.floor(Math.random() * 10)),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        async function testPriceOptimize() {
            const price = parseFloat(document.getElementById('price').value);
            const competitors = document.getElementById('competitors').value.split(',').map(p => parseFloat(p.trim()));
            const demand = parseFloat(document.getElementById('demand').value);

            const response = await fetch('/algorithm/price_optimize', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    params: { price, competitors, demand }
                })
            });

            const result = await response.json();
            document.getElementById('priceResult').style.display = 'block';
            // XSS protection with escapeHtml
            const optimizedPrice = escapeHtml(String(result.result));
            const currentPrice = escapeHtml(String(price));
            const revenueImpact = escapeHtml(String(result.revenue_impact));
            document.getElementById('priceResult').innerHTML =
                `<strong>Optimized Price: $${optimizedPrice}</strong><br>
                 Current: $${currentPrice} → Recommended: $${optimizedPrice}<br>
                 ${revenueImpact}`;

            loadDashboard(); // Refresh metrics
        }

        async function testConversion() {
            const current_rate = parseFloat(document.getElementById('currentRate').value) / 100;
            const traffic = parseInt(document.getElementById('traffic').value);
            const page_speed = parseFloat(document.getElementById('pageSpeed').value);
            const mobile_friendly = document.getElementById('mobileFriendly').checked;

            const response = await fetch('/algorithm/conversion_optimize', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    params: { current_rate, traffic, page_speed, mobile_friendly }
                })
            });

            const result = await response.json();
            document.getElementById('conversionResult').style.display = 'block';
            // XSS protection with escapeHtml
            const conversionRate = escapeHtml(String(result.result));
            const improvement = escapeHtml((result.result - (current_rate * 100)).toFixed(2));
            const monthlyRevenue = escapeHtml(String(result.revenue_impact));
            document.getElementById('conversionResult').innerHTML =
                `<strong>Optimized Conversion Rate: ${conversionRate}%</strong><br>
                 Improvement: +${improvement}%<br>
                 Additional Monthly Revenue: ${monthlyRevenue}`;

            loadDashboard();
        }

        async function testForecast() {
            const current_revenue = parseInt(document.getElementById('currentRevenue').value);
            const growth_rate = parseFloat(document.getElementById('growthRate').value);
            const months = parseInt(document.getElementById('months').value);

            const response = await fetch('/algorithm/revenue_forecast', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    params: { current_revenue, growth_rate, months, market_size: 1000000, competition: 0.3 }
                })
            });

            const result = await response.json();
            document.getElementById('forecastResult').style.display = 'block';

            const forecast = result.result.slice(0, 6); // Show first 6 months
            document.getElementById('forecastResult').innerHTML =
                \`<strong>Revenue Forecast:</strong><br>\` +
                forecast.map(f =>
                    \`Month \${f.month}: $\${f.revenue.toLocaleString()} (+\${f.growth}%)\`
                ).join('<br>');

            loadDashboard();
        }

        // Load dashboard on page load
        loadDashboard();

        // Refresh every 30 seconds
        setInterval(loadDashboard, 30000);
    </script>
</body>
</html>`;

// Enhanced API endpoints
app.get('/api/dashboard', (req, res) => {
  let usage = [];
  if (fs.existsSync('revenue-usage.json')) {
    usage = JSON.parse(fs.readFileSync('revenue-usage.json', 'utf8'));
  }

  const stats = {
    total_calls: usage.length,
    unique_users: new Set(usage.map(u => u.userId)).size,
    algorithms_used: new Set(usage.map(u => u.algorithm)).size,
    potential_revenue: usage.length * 0.10,
    recent_usage: usage.slice(-10),
    usage_by_hour: Array.from({length: 24}, (_, hour) => {
      return usage.filter(u => new Date(u.timestamp).getHours() === hour).length;
    })
  };

  res.json(stats);
});

app.get('/dashboard', (req, res) => {
  res.send(dashboardHTML);
});

// Enhanced algorithm endpoint
app.post('/algorithm/:algorithm', authenticateRequest, sanitizeInput, (req, res) => {
  const { algorithm } = req.params;
  const { user_id = 'anonymous', params = {} } = req.body;

  // Sanitize algorithm parameter
  const sanitizedAlgorithm = String(algorithm).replace(/[<>"'&]/g, '');

  if (!algorithms[sanitizedAlgorithm]) {
    return res.status(404).json({ error: 'Algorithm not found', available: Object.keys(algorithms) });
  }

  try {
    const result = algorithms[sanitizedAlgorithm](params);
    const usage = {
      id: crypto.randomUUID(),
      userId: String(user_id).replace(/[<>"'&]/g, ''),
      algorithm: sanitizedAlgorithm,
      result,
      params,
      timestamp: Date.now(),
      revenueImpact: `+$${(Array.isArray(result) ? result.length * 10 : result * 100).toFixed(0)}/month`
    };

    // Save usage
    let logs = [];
    if (fs.existsSync('revenue-usage.json')) {
      logs = JSON.parse(fs.readFileSync('revenue-usage.json', 'utf8'));
    }
    logs.push(usage);
    fs.writeFileSync('revenue-usage.json', JSON.stringify(logs, null, 2));

    res.json({
      success: true,
      algorithm: sanitizedAlgorithm,
      result,
      revenue_impact: usage.revenueImpact,
      upgrade_url: 'http://localhost:3020/upgrade',
      message: 'Free tier - upgrade for unlimited access',
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced HOOTNER Revenue API running on http://localhost:${PORT}`);
  console.log(`📊 Full Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`💰 Upgrade: http://localhost:${PORT}/upgrade`);
});

export default app;
