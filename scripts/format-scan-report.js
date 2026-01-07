#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const reportPath = process.argv[2] || 'apps/frontend/html-pages/code-scan-report.txt';
const outputPath = reportPath.replace('.txt', '-formatted.html');

const content = fs.readFileSync(reportPath, 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Scan Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0d1117; color: #c9d1d9; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #58a6ff; margin-bottom: 20px; }
    .summary { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
    .stat { background: #0d1117; padding: 15px; border-radius: 6px; border-left: 3px solid #58a6ff; }
    .stat-label { color: #8b949e; font-size: 12px; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
    .section { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
    .section-title { color: #f85149; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
    .section-title.warning { color: #d29922; }
    .file-group { background: #0d1117; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
    .file-name { color: #58a6ff; font-weight: bold; margin-bottom: 10px; }
    .issue { padding: 8px 12px; margin: 5px 0; background: #161b22; border-left: 3px solid #f85149; border-radius: 3px; font-size: 14px; }
    .issue.warning { border-left-color: #d29922; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .badge.error { background: #f85149; color: #fff; }
    .badge.warning { background: #d29922; color: #000; }
    .filter { margin-bottom: 20px; }
    .filter input { background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; padding: 10px; border-radius: 6px; width: 100%; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Code Scan Report</h1>

    <div class="summary">
      <div><strong>Timestamp:</strong> ${new Date().toLocaleString()}</div>
      <div class="stats">
        <div class="stat">
          <div class="stat-label">Files Scanned</div>
          <div class="stat-value">${content.match(/Files Scanned: (\d+)/)?.[1] || '0'}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Errors</div>
          <div class="stat-value" style="color: #f85149">${content.match(/Errors: (\d+)/)?.[1] || '0'}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Warnings</div>
          <div class="stat-value" style="color: #d29922">${content.match(/Warnings: (\d+)/)?.[1] || '0'}</div>
        </div>
      </div>
    </div>

    <div class="filter">
      <input type="text" id="search" placeholder="🔍 Filter by file name or issue..." onkeyup="filterIssues()">
    </div>

    <div class="section">
      <div class="section-title">
        <span class="badge error">ERRORS</span>
        Critical Issues
      </div>
      <div id="errors">${parseErrors(content)}</div>
    </div>

    <div class="section">
      <div class="section-title warning">
        <span class="badge warning">WARNINGS</span>
        Code Quality Issues
      </div>
      <div id="warnings">${parseWarnings(content)}</div>
    </div>
  </div>

  <script>
    function filterIssues() { const query = document.getElementById('search').value.toLowerCase();
      document.querySelectorAll('.file-group').forEach(group => { const text = group.textContent.toLowerCase();
        group.style.display = text.includes(query) ? 'block' : 'none'; }); }
  </script>
</body>
</html>`;

function parseErrors(text) { const errorSection = text.match(/ERRORS \(\d+\):[\s\S]*?(?=WARNINGS|$)/)?.[0] || '';
  const files = errorSection.split('📛').slice(1);

  return files.map(file => { const lines = file.trim().split('\n');
    const fileName = lines[0].trim();
    const issues = lines.slice(1).filter(l => l.trim());

    return `
      <div class="file-group">
        <div class="file-name">📛 ${fileName}</div>
        ${issues.map(issue => `<div class="issue">${issue.trim()}</div>`).join('')}
      </div>
    `; }).join(''); }

function parseWarnings(text) { const warningSection = text.match(/WARNINGS \(\d+\):[\s\S]*/)?.[0] || '';
  const files = warningSection.split('⚠️').slice(1);

  return files.slice(0, 50).map(file => { const lines = file.trim().split('\n');
    const fileName = lines[0].trim();
    const issues = lines.slice(1).filter(l => l.trim()).slice(0, 10);

    return `
      <div class="file-group">
        <div class="file-name">⚠️ ${fileName}</div>
        ${issues.map(issue => `<div class="issue warning">${issue.trim()}</div>`).join('')}
        ${lines.length > 11 ? '<div style="color: #8b949e; font-size: 12px; margin-top: 10px;">... and more</div>' : ''}
      </div>
    `; }).join('') + (files.length > 50 ? '<div style="color: #8b949e; text-align: center; padding: 20px;">... and more files</div>' : ''); }

fs.writeFileSync(outputPath, html);
