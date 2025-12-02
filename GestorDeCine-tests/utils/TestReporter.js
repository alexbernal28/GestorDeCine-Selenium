import fs from 'fs';
import path from 'path';

export class TestReporter {
    constructor(suiteName) {
        this.suiteName = suiteName;
        this.tests = [];
        this.startTime = new Date();
        this.reportDir = './test-results/reports';

        // Crear directorio si no existe
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir, { recursive: true });
        }
    }

    addTest(testName, status, message = '', screenshot = null) {
        this.tests.push({
            name: testName,
            status: status, // 'passed', 'failed', 'warning'
            message: message,
            screenshot: screenshot,
            timestamp: new Date().toISOString()
        });
    }

    getStats() {
        const passed = this.tests.filter(t => t.status === 'passed').length;
        const failed = this.tests.filter(t => t.status === 'failed').length;
        const warnings = this.tests.filter(t => t.status === 'warning').length;
        const total = this.tests.length;

        return { passed, failed, warnings, total };
    }

    generateReport() {
        const endTime = new Date();
        const duration = (endTime - this.startTime) / 1000; // segundos
        const stats = this.getStats();

        const html = this.generateHTML(stats, duration);
        const json = this.generateJSON(stats, duration);

        const timestamp = this.startTime.toISOString().replace(/:/g, '-').split('.')[0];
        const htmlFile = path.join(this.reportDir, `${this.suiteName.replace(/\s/g, '_')}_${timestamp}.html`);
        const jsonFile = path.join(this.reportDir, `${this.suiteName.replace(/\s/g, '_')}_${timestamp}.json`);

        fs.writeFileSync(htmlFile, html);
        fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));

        console.log(`\nReporte generado:`);
        console.log(`   HTML: ${htmlFile}`);
        console.log(`   JSON: ${jsonFile}`);

        return { htmlFile, jsonFile };
    }

    generateHTML(stats, duration) {
        const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Pruebas - ${this.suiteName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-card .number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-card .label {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card.passed .number { color: #28a745; }
        .stat-card.failed .number { color: #dc3545; }
        .stat-card.warnings .number { color: #ffc107; }
        .stat-card.total .number { color: #667eea; }
        
        .progress-bar {
            margin: 0 40px 40px;
            background: #e9ecef;
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.5s ease;
        }
        
        .tests-list {
            padding: 40px;
        }
        
        .tests-list h2 {
            margin-bottom: 25px;
            color: #343a40;
            font-size: 1.8em;
        }
        
        .test-item {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.2s;
        }
        
        .test-item:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }
        
        .test-item.passed { border-left: 5px solid #28a745; }
        .test-item.failed { border-left: 5px solid #dc3545; }
        .test-item.warning { border-left: 5px solid #ffc107; }
        
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .test-name {
            font-size: 1.1em;
            font-weight: 600;
            color: #343a40;
        }
        
        .test-status {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .test-status.passed {
            background: #d4edda;
            color: #155724;
        }
        
        .test-status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .test-status.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .test-message {
            color: #6c757d;
            font-size: 0.95em;
            line-height: 1.5;
        }
        
        .test-timestamp {
            color: #adb5bd;
            font-size: 0.85em;
            margin-top: 8px;
        }
        
        .footer {
            background: #343a40;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            margin: 5px 0;
            opacity: 0.8;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reporte de Pruebas Automatizadas</h1>
            <p>${this.suiteName}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card total">
                <div class="number">${stats.total}</div>
                <div class="label">Total Pruebas</div>
            </div>
            <div class="stat-card passed">
                <div class="number">${stats.passed}</div>
                <div class="label">Pasadas</div>
            </div>
            <div class="stat-card failed">
                <div class="number">${stats.failed}</div>
                <div class="label">Fallidas</div>
            </div>
            <div class="stat-card warnings">
                <div class="number">${stats.warnings}</div>
                <div class="label">Advertencias</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${passRate}%;">
                ${passRate}% Éxito
            </div>
        </div>
        
        <div class="tests-list">
            <h2>Detalle de Pruebas</h2>
            ${this.tests.map(test => `
                <div class="test-item ${test.status}">
                    <div class="test-header">
                        <div class="test-name">${test.name}</div>
                        <span class="test-status ${test.status}">${test.status}</span>
                    </div>
                    <div class="test-message">${test.message}</div>
                    <div class="test-timestamp">${new Date(test.timestamp).toLocaleString('es-ES')}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p><strong>Duración Total:</strong> ${duration.toFixed(2)} segundos</p>
            <p><strong>Fecha de Ejecución:</strong> ${this.startTime.toLocaleString('es-ES')}</p>
            <p><strong>Proyecto:</strong> Gestor de Cine - Pruebas con Selenium WebDriver</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    generateJSON(stats, duration) {
        return {
            suiteName: this.suiteName,
            startTime: this.startTime.toISOString(),
            duration: duration,
            statistics: stats,
            tests: this.tests
        };
    }
}