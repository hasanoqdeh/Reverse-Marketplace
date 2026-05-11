#!/usr/bin/env node

// Test Report Generator
// Converts JSON test results to HTML report

const fs = require('fs');
const path = require('path');

function generateHTMLReport(jsonFile) {
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .results { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .test-item { padding: 15px; border-bottom: 1px solid #eee; display: grid; grid-template-columns: 1fr auto auto auto; gap: 15px; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-skipped { background: #fff3cd; color: #856404; }
        .test-details { font-size: 0.9em; color: #666; }
        .filter-buttons { margin-bottom: 20px; }
        .filter-btn { padding: 8px 16px; margin-right: 10px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; }
        .filter-btn.active { background: #007bff; color: white; border-color: #007bff; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>API Test Report</h1>
            <p><strong>Environment:</strong> ${data.testRun.environment}</p>
            <p><strong>Base URL:</strong> ${data.testRun.baseUrl}</p>
            <p><strong>Test Phone:</strong> ${data.testRun.testPhone}</p>
            <p><strong>Timestamp:</strong> ${new Date(data.testRun.timestamp).toLocaleString()}</p>
            ${data.testRun.duration ? `<p><strong>Duration:</strong> ${data.testRun.duration}s</p>` : ''}
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${data.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${data.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${data.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Skipped</h3>
                <div class="value skipped">${data.summary.skipped}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value">${data.summary.successRate}%</div>
            </div>
        </div>

        <div class="filter-buttons">
            <button class="filter-btn active" onclick="filterTests('all')">All</button>
            <button class="filter-btn" onclick="filterTests('passed')">Passed</button>
            <button class="filter-btn" onclick="filterTests('failed')">Failed</button>
            <button class="filter-btn" onclick="filterTests('skipped')">Skipped</button>
        </div>

        <div class="results">
            ${data.results.map(test => `
                <div class="test-item" data-status="${test.status.toLowerCase()}">
                    <div class="test-name">${test.name}</div>
                    <div class="test-status status-${test.status.toLowerCase()}">${test.status}</div>
                    <div class="test-details">
                        HTTP ${test.httpStatus} • ${test.responseTime}s • ${test.method} ${test.endpoint}
                    </div>
                    ${test.errorMessage ? `<div class="test-details" style="color: #dc3545;">${test.errorMessage}</div>` : ''}
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        function filterTests(status) {
            const items = document.querySelectorAll('.test-item');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            items.forEach(item => {
                if (status === 'all' || item.dataset.status === status) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }
    </script>
</body>
</html>`;

    const outputFile = jsonFile.replace('.json', '.html');
    fs.writeFileSync(outputFile, html);
    console.log(`HTML report generated: ${outputFile}`);
}

// Get the JSON file from command line arguments
const jsonFile = process.argv[2];
if (!jsonFile) {
    console.error('Usage: node generate-test-report.js <json-file>');
    process.exit(1);
}

if (!fs.existsSync(jsonFile)) {
    console.error(`File not found: ${jsonFile}`);
    process.exit(1);
}

generateHTMLReport(jsonFile);
