import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

console.log('------------------------------------------------------');
console.log('   GESTOR DE CINE - SUITE DE PRUEBAS AUTOMATIZADAS    ');
console.log('------------------------------------------------------');

async function runAllTests() {
    const startTime = Date.now();
    
    // Crear directorios necesarios
    createDirectories();
    
    console.log('Iniciando suite completa de pruebas...\n');
    
    const testSuites = [
        { name: 'Géneros', file: 'tests/genres.test.js' },
        { name: 'Series', file: 'tests/series.test.js' },
        { name: 'Filtros', file: 'tests/filters.test.js' }
    ];
    
    const results = [];
    
    for (const suite of testSuites) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Ejecutando: ${suite.name}`);
        console.log('='.repeat(60));
        
        try {
            const { stdout, stderr } = await execPromise(`node ${suite.file}`);
            
            console.log(stdout);
            if (stderr) console.error(stderr);
            
            results.push({
                suite: suite.name,
                status: 'completed',
                output: stdout
            });
            
        } catch (error) {
            console.error(`Error ejecutando ${suite.name}:`, error.message);
            results.push({
                suite: suite.name,
                status: 'error',
                error: error.message
            });
        }
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Resumen final
    console.log('\n\n' + '═'.repeat(60));
    console.log('RESUMEN DE EJECUCIÓN');
    console.log('═'.repeat(60) + '\n');
    
    results.forEach(result => {
        const status = result.status === 'completed' ? 'Correct' : 'Error';
        console.log(`${status} ${result.suite}: ${result.status.toUpperCase()}`);
    });
    
    console.log(`\nDuración total: ${duration} segundos`);
    console.log(`Reportes guardados en: ./test-results/reports/`);
    console.log(`Screenshots en: ./test-results/screenshots/\n`);
    
    // Generar reporte consolidado
    generateConsolidatedReport(results, duration);
    
    console.log('═'.repeat(60));
    console.log('EJECUCIÓN COMPLETADA');
    console.log('═'.repeat(60) + '\n');
}

function createDirectories() {
    const dirs = [
        './test-results',
        './test-results/reports',
        './test-results/screenshots'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function generateConsolidatedReport(results, duration) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const reportPath = `./test-results/reports/consolidated_report_${timestamp}.html`;
    
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Consolidado - Gestor de Cine</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
        }
        
        .content {
            padding: 40px;
        }
        
        .suite {
            background: #f8f9fa;
            border-left: 5px solid #667eea;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        
        .suite.completed {
            border-left-color: #28a745;
        }
        
        .suite.error {
            border-left-color: #dc3545;
        }
        
        .suite h2 {
            margin: 0 0 10px 0;
            color: #343a40;
        }
        
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .status.completed {
            background: #d4edda;
            color: #155724;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .footer {
            background: #343a40;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reporte Consolidado</h1>
            <p>Pruebas Automatizadas - Gestor de Cine</p>
        </div>
        
        <div class="content">
            <div class="info-box">
                <strong>Duración Total:</strong> ${duration} segundos<br>
                <strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}<br>
                <strong>Suites Ejecutadas:</strong> ${results.length}
            </div>
            
            <h2>Resultados por Suite</h2>
            ${results.map(result => `
                <div class="suite ${result.status}">
                    <h2>
                        ${result.status === 'completed' ? 'Correct' : 'Error'} 
                        ${result.suite}
                    </h2>
                    <span class="status ${result.status}">${result.status.toUpperCase()}</span>
                    ${result.error ? `<p style="color: #dc3545; margin-top: 10px;">Error: ${result.error}</p>` : ''}
                </div>
            `).join('')}
            
            <div class="info-box">
                <strong>Ubicación de Reportes:</strong><br>
                - Reportes detallados: <code>./test-results/reports/</code><br>
                - Screenshots: <code>./test-results/screenshots/</code>
            </div>
        </div>
        
        <div class="footer">
            <p>Gestor de Cine - Selenium WebDriver Testing Framework</p>
            <p>Generado automáticamente</p>
        </div>
    </div>
</body>
</html>
    `;
    
    fs.writeFileSync(reportPath, html);
    console.log(`\nReporte consolidado generado: ${reportPath}`);
}

// Ejecutar
runAllTests().catch(console.error);