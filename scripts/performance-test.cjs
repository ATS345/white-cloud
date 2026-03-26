const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_DURATION = 10000;

const testResults = {
  startTime: null,
  endTime: null,
  tests: [],
  summary: {}
};

function measureRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          path,
          method,
          statusCode: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path,
        method,
        statusCode: 0,
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runPerformanceTests() {
  console.log('🚀 开始性能测试...\n');
  testResults.startTime = new Date().toISOString();

  const testEndpoints = [
    { path: '/health', name: '健康检查' },
    { path: '/api/v1/games', name: '游戏列表' },
    { path: '/api/v1/games?page=1&limit=10', name: '游戏列表分页' },
    { path: '/api/v1/health/database', name: '数据库健康检查' },
    { path: '/api/v1/health/info', name: '系统信息' }
  ];

  for (const endpoint of testEndpoints) {
    console.log(`📊 测试: ${endpoint.name}`);
    
    const results = [];
    for (let i = 0; i < 10; i++) {
      const result = await measureRequest(endpoint.path);
      results.push(result);
      process.stdout.write(`  测试 ${i + 1}/10: ${result.duration}ms ${result.success ? '✅' : '❌'}\n`);
    }

    const successCount = results.filter(r => r.success).length;
    const durations = results.filter(r => r.success).map(r => r.duration);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const p50 = durations.length > 0 ? getPercentile(durations, 50) : 0;
    const p95 = durations.length > 0 ? getPercentile(durations, 95) : 0;
    const p99 = durations.length > 0 ? getPercentile(durations, 99) : 0;

    testResults.tests.push({
      name: endpoint.name,
      path: endpoint.path,
      successRate: (successCount / results.length * 100).toFixed(2) + '%',
      avgDuration: avgDuration.toFixed(2) + 'ms',
      minDuration: minDuration + 'ms',
      maxDuration: maxDuration + 'ms',
      p50: p50 + 'ms',
      p95: p95 + 'ms',
      p99: p99 + 'ms',
      results: results
    });

    console.log(`  成功率: ${successCount}/${results.length} (${(successCount / results.length * 100).toFixed(2)}%)`);
    console.log(`  平均响应时间: ${avgDuration.toFixed(2)}ms`);
    console.log(`  P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`);
    console.log('');
  }

  testResults.endTime = new Date().toISOString();
  generateSummary();
  saveReport();
}

function getPercentile(arr, percentile) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function generateSummary() {
  const allDurations = testResults.tests.flatMap(t => t.results.filter(r => r.success).map(r => r.duration));
  const allSuccess = testResults.tests.flatMap(t => t.results.map(r => r.success));
  
  const totalRequests = allSuccess.length;
  const successfulRequests = allSuccess.filter(s => s).length;
  const failedRequests = totalRequests - successfulRequests;
  
  testResults.summary = {
    totalRequests,
    successfulRequests,
    failedRequests,
    overallSuccessRate: ((successfulRequests / totalRequests) * 100).toFixed(2) + '%',
    avgResponseTime: allDurations.length > 0 ? (allDurations.reduce((a, b) => a + b, 0) / allDurations.length).toFixed(2) + 'ms' : '0ms',
    totalTestDuration: TEST_DURATION + 'ms',
    testDate: new Date().toLocaleString('zh-CN')
  };
}

function saveReport() {
  const fs = require('fs');
  const path = require('path');
  
  const reportPath = path.join(__dirname, '..', 'PERFORMANCE_TEST_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  console.log('📝 性能测试报告已保存:', reportPath);
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 性能测试总结');
  console.log('='.repeat(60));
  console.log(`总请求数: ${testResults.summary.totalRequests}`);
  console.log(`成功请求: ${testResults.summary.successfulRequests}`);
  console.log(`失败请求: ${testResults.summary.failedRequests}`);
  console.log(`总体成功率: ${testResults.summary.overallSuccessRate}`);
  console.log(`平均响应时间: ${testResults.summary.avgResponseTime}`);
  console.log(`测试时间: ${testResults.summary.testDate}`);
  console.log('='.repeat(60));
  
  console.log('\n✅ 性能测试完成！');
}

runPerformanceTests().catch(console.error);
