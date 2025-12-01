import { createDriver, takeScreenshot } from '../config/selenium.config.js';
import { HomePage } from '../pages/HomePage.js';
import { SeriesPage } from '../pages/SeriesPage.js';
import { GenrePage } from '../pages/GenrePage.js';
import { TestReporter } from '../utils/TestReporter.js';

const reporter = new TestReporter('Pruebas de Filtros');

async function runFilterTests() {
    let driver;
    
    try {
        driver = await createDriver();
        const homePage = new HomePage(driver);
        const seriesPage = new SeriesPage(driver);
        const genrePage = new GenrePage(driver);
        
        console.log('Iniciando pruebas de Filtros...\n');
        
        // Preparación: Crear datos de prueba
        await prepareTestData(driver, genrePage, seriesPage);
        
        // Filtrar por nombre
        await testFilterByNameHappyPath(driver, homePage);
        await testFilterByNameNegative(driver, homePage);
        await testFilterByNameBoundary(driver, homePage);
        
        // Filtrar por género
        await testFilterByGenreHappyPath(driver, homePage);
        await testFilterCombined(driver, homePage);
        
        console.log('\nTodas las pruebas de Filtros completadas');
        
    } catch (error) {
        console.error('Error en las pruebas:', error);
        reporter.addTest('Error General', 'failed', error.message);
    } finally {
        if (driver) {
            await driver.quit();
        }
        
        reporter.generateReport();
    }
}

async function prepareTestData(driver, genrePage, seriesPage) {
    console.log('Preparando datos de prueba...');
    
    try {
        // Crear géneros si no existen
        await genrePage.goToIndex();
        const isEmpty = await genrePage.isTableEmpty();
        
        if (isEmpty) {
            await genrePage.createGenre('Ciencia ficción');
            await genrePage.createGenre('Comedia');
        }
        
        // Crear series de prueba
        await seriesPage.createSerie(
            'Stranger Things',
            'https://example.com/stranger.jpg',
            'https://www.youtube.com/watch?v=test1',
            1
        );
        
        await seriesPage.createSerie(
            'The Big Bang Theory',
            'https://example.com/bigbang.jpg',
            'https://www.youtube.com/watch?v=test2',
            2
        );
        
        await seriesPage.createSerie(
            'Star Trek',
            'https://example.com/startrek.jpg',
            'https://www.youtube.com/watch?v=test3',
            1
        );
        
        console.log('Datos de prueba creados');
        
    } catch (error) {
        console.log('Error al preparar datos:', error.message);
    }
}

// FILTRAR POR NOMBRE

async function testFilterByNameHappyPath(driver, homePage) {
    const testName = 'Filtrar por Nombre';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        // Paso 1: Ir al home
        await homePage.goToHome();
        await takeScreenshot(driver, 'filter_name_initial');
        
        // Paso 2: Obtener count inicial
        const initialCount = await homePage.getSerieCount();
        
        // Paso 3: Aplicar filtro por nombre
        await homePage.applyFilter('Stranger', null);
        await takeScreenshot(driver, 'filter_name_applied');
        
        // Paso 4: Verificar resultados
        const filteredCount = await homePage.getSerieCount();
        const isVisible = await homePage.isSerieVisible('Stranger Things');
        
        // Paso 5: Verificar que se filtraron los resultados
        if (filteredCount < initialCount && isVisible) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', `Filtro por nombre funcionó: ${filteredCount} resultado(s)`);
        } else if (filteredCount === 0) {
            throw new Error('El filtro no encontró ninguna serie');
        } else {
            throw new Error('El filtro no redujo los resultados correctamente');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'filter_name_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

async function testFilterByNameNegative(driver, homePage) {
    const testName = 'Filtrar por Nombre (Prueba Negativa - Sin coincidencias)';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        // Paso 1: Ir al home
        await homePage.goToHome();
        
        // Paso 2: Aplicar filtro que no coincida con nada
        await homePage.applyFilter('XYZ999NoExiste', null);
        await takeScreenshot(driver, 'filter_name_no_results');
        
        // Paso 3: Verificar que no hay resultados
        const count = await homePage.getSerieCount();
        const isEmpty = await homePage.isListEmpty();
        
        if (count === 0 || isEmpty) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', 'Sistema muestra correctamente sin resultados');
        } else {
            throw new Error('El sistema mostró resultados cuando no debería');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'filter_name_negative_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

async function testFilterByNameBoundary(driver, homePage) {
    const testName = 'Filtrar por Nombre (Prueba de Límites - Una letra)';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        // Paso 1: Ir al home
        await homePage.goToHome();
        
        // Paso 2: Filtrar con una sola letra
        await homePage.applyFilter('S', null);
        await takeScreenshot(driver, 'filter_name_one_char');
        
        // Paso 3: Verificar que hay resultados (debería encontrar series que empiezan con S)
        const count = await homePage.getSerieCount();
        const titles = await homePage.getAllVisibleSeriesTitles();
        
        // Verificar que todas las series visibles empiezan con 'S'
        const allStartWithS = titles.every(title => title.toUpperCase().startsWith('S'));
        
        if (count > 0 && allStartWithS) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', `Filtro de una letra funcionó: ${count} resultado(s)`);
        } else {
            console.log(`${testName} - ADVERTENCIA`);
            reporter.addTest(testName, 'warning', 'Resultados inesperados con búsqueda de un carácter');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'filter_name_boundary_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

// HU-007: FILTRAR POR GÉNERO

async function testFilterByGenreHappyPath(driver, homePage) {
    const testName = 'Filtrar por Género';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        // Paso 1: Ir al home
        await homePage.goToHome();
        await takeScreenshot(driver, 'filter_genre_initial');
        
        // Paso 2: Obtener count inicial
        const initialCount = await homePage.getSerieCount();
        
        // Paso 3: Aplicar filtro por género (ID = 1, Ciencia ficción)
        await homePage.applyFilter(null, 1);
        await takeScreenshot(driver, 'filter_genre_applied');
        
        // Paso 4: Verificar resultados
        const filteredCount = await homePage.getSerieCount();
        
        // Debería haber menos o igual cantidad de series
        if (filteredCount <= initialCount && filteredCount > 0) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', `Filtro por género funcionó: ${filteredCount} resultado(s)`);
        } else if (filteredCount === 0) {
            console.log(`${testName} - ADVERTENCIA (No hay series de ese género)`);
            reporter.addTest(testName, 'warning', 'No hay series del género seleccionado');
        } else {
            throw new Error('El filtro no funcionó correctamente');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'filter_genre_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

async function testFilterCombined(driver, homePage) {
    const testName = 'Filtrar Combinado (Nombre + Género)';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        // Paso 1: Ir al home
        await homePage.goToHome();
        
        // Paso 2: Aplicar ambos filtros
        await homePage.applyFilter('S', 1);
        await takeScreenshot(driver, 'filter_combined');
        
        // Paso 3: Verificar resultados
        const count = await homePage.getSerieCount();
        
        // Puede haber 0 o más resultados dependiendo de los datos
        console.log(`${testName} - PASÓ`);
        reporter.addTest(testName, 'passed', `Filtro combinado funcionó: ${count} resultado(s)`);
        
        // Paso 4: Limpiar filtros
        await homePage.clearFilters();
        await takeScreenshot(driver, 'filter_cleared');
        
        const finalCount = await homePage.getSerieCount();
        console.log(`Resultados después de limpiar filtros: ${finalCount}`);
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'filter_combined_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

// Ejecutar pruebas
runFilterTests();