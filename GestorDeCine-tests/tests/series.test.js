import { createDriver, takeScreenshot } from '../config/selenium.config.js';
import { SeriesPage } from '../pages/SeriesPage.js';
import { GenrePage } from '../pages/GenrePage.js';
import { TestReporter } from '../utils/TestReporter.js';

const reporter = new TestReporter('Pruebas de Series');

async function runSeriesTests() {
    let driver;
    
    try {
        driver = await createDriver();
        const seriesPage = new SeriesPage(driver);
        const genrePage = new GenrePage(driver);
        
        console.log('Iniciando pruebas de Series...\n');
        
        // Preparación: Asegurar que existe al menos un género
        await ensureGenreExists(driver, genrePage);
        
        // Crear serie
        await testCreateSerieHappyPath(driver, seriesPage);
        await testCreateSerieNegative(driver, seriesPage);
        await testCreateSerieBoundary(driver, seriesPage);
        
        // Editar serie
        await testEditSerieHappyPath(driver, seriesPage);
        await testEditSerieNegative(driver, seriesPage);
        
        console.log('\nTodas las pruebas de Series completadas');
        
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

async function ensureGenreExists(driver, genrePage) {
    try {
        await genrePage.goToIndex();
        const isEmpty = await genrePage.isTableEmpty();
        
        if (isEmpty) {
            console.log('Creando género de prueba...');
            await genrePage.createGenre('Ciencia ficción');
        }
    } catch (error) {
        console.error('Error al verificar géneros:', error);
    }
}

// CREAR SERIE

async function testCreateSerieHappyPath(driver, seriesPage) {
    const testName = 'Crear Serie';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        const serieName = `Breaking Bad-${Date.now()}`;
        const frontPage = 'https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg';
        const youtubeLink = 'https://www.youtube.com/watch?v=HhesaQXLuRY';
        const genreId = 1;
        
        // Paso 1: Navegar a crear
        await seriesPage.goToCreate();
        await takeScreenshot(driver, 'create_serie_form');
        
        // Verificar que no hay alerta de géneros faltantes
        const hasAlert = await seriesPage.hasNoGenresAlert();
        if (hasAlert) {
            throw new Error('No hay géneros disponibles para crear series');
        }
        
        // Paso 2: Llenar formulario
        await seriesPage.fillSerieForm(serieName, frontPage, youtubeLink, null);
        await seriesPage.selectGenre(genreId);
        await takeScreenshot(driver, 'create_serie_filled');
        
        // Paso 3: Guardar
        await seriesPage.clickSaveButton();
        await takeScreenshot(driver, 'create_serie_saved');
        
        // Paso 4: Verificar
        const currentUrl = await seriesPage.getCurrentUrl();
        const isRedirected = currentUrl.includes('/series/index');
        
        if (isRedirected) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', `Serie "${serieName}" creada exitosamente`);
        } else {
            throw new Error('La serie no se creó correctamente');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'create_serie_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

async function testCreateSerieNegative(driver, seriesPage) {
    const testName = 'Crear Serie (Prueba Negativa - Campos vacíos)';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        // Paso 1: Navegar a crear
        await seriesPage.goToCreate();
        
        // Paso 2: Intentar guardar sin llenar nada
        await takeScreenshot(driver, 'create_serie_empty_fields');
        
        await seriesPage.clickSaveButton();
        await driver.sleep(500);
        
        // Paso 3: Verificar que seguimos en create
        const currentUrl = await seriesPage.getCurrentUrl();
        const stillInCreatePage = currentUrl.includes('/series/create');
        
        if (stillInCreatePage) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', 'Sistema previno crear serie sin datos completos');
        } else {
            throw new Error('Sistema permitió crear serie sin datos');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'create_serie_negative_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

async function testCreateSerieBoundary(driver, seriesPage) {
    const testName = 'Crear Serie (Prueba de Límites - URL inválida)';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        const serieName = `TestSerie-${Date.now()}`;
        const invalidUrl = 'esto-no-es-una-url';
        const genreId = 1;
        
        // Paso 1: Navegar a crear
        await seriesPage.goToCreate();
        
        // Paso 2: Llenar con URL inválida
        await seriesPage.fillSerieForm(serieName, invalidUrl, invalidUrl, null);
        await seriesPage.selectGenre(genreId);
        await takeScreenshot(driver, 'create_serie_invalid_url');
        
        // Paso 3: Intentar guardar
        await seriesPage.clickSaveButton();
        await driver.sleep(1000);
        
        // El sistema puede aceptarlo o rechazarlo dependiendo de validaciones
        const currentUrl = await seriesPage.getCurrentUrl();
        
        if (currentUrl.includes('/series/index')) {
            console.log(`${testName} - ADVERTENCIA (Sistema aceptó URL inválida)`);
            reporter.addTest(testName, 'warning', 'Sistema no valida formato de URL');
        } else {
            console.log(`${testName} - PASÓ (Sistema rechazó URL inválida)`);
            reporter.addTest(testName, 'passed', 'Sistema validó formato de URL');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'create_serie_boundary_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

// EDITAR SERIE

async function testEditSerieHappyPath(driver, seriesPage) {
    const testName = 'Editar Serie (Camino Feliz)';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        // Preparación: Crear serie para editar
        const initialName = `ParaEditar-${Date.now()}`;
        await seriesPage.createSerie(
            initialName,
            'https://example.com/test.jpg',
            'https://www.youtube.com/watch?v=test',
            1
        );
        
        // Paso 1: Navegar a editar (asumimos ID = 1)
        const seriesId = 1;
        await seriesPage.goToEdit(seriesId);
        await takeScreenshot(driver, 'edit_serie_form');
        
        // Paso 2: Modificar datos
        const newName = `Editada-${Date.now()}`;
        const newFrontPage = 'https://example.com/edited.jpg';
        
        await seriesPage.fillSerieForm(newName, newFrontPage, null, null);
        await takeScreenshot(driver, 'edit_serie_modified');
        
        // Paso 3: Guardar
        await seriesPage.clickSaveButton();
        await takeScreenshot(driver, 'edit_serie_saved');
        
        // Paso 4: Verificar
        const currentUrl = await seriesPage.getCurrentUrl();
        const isRedirected = currentUrl.includes('/series/index');
        
        if (isRedirected) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', `Serie editada a "${newName}"`);
        } else {
            throw new Error('La edición no se completó correctamente');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'edit_serie_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

async function testEditSerieNegative(driver, seriesPage) {
    const testName = 'Editar Serie (Prueba Negativa - Vaciar nombre)';
    console.log(`\nEjecutando: ${testName}`);
    
    try {
        const seriesId = 1;
        
        // Paso 1: Navegar a editar
        await seriesPage.goToEdit(seriesId);
        
        // Paso 2: Vaciar el nombre
        await seriesPage.fillSerieForm('', null, null, null);
        await takeScreenshot(driver, 'edit_serie_empty_name');
        
        // Paso 3: Intentar guardar
        await seriesPage.clickSaveButton();
        await driver.sleep(500);
        
        // Paso 4: Verificar que no se guardó
        const currentUrl = await seriesPage.getCurrentUrl();
        const stillInEditPage = currentUrl.includes('/series/edit');
        
        if (stillInEditPage) {
            console.log(`${testName} - PASÓ`);
            reporter.addTest(testName, 'passed', 'Sistema previno editar con nombre vacío');
        } else {
            throw new Error('Sistema permitió editar con nombre vacío');
        }
        
    } catch (error) {
        console.log(`${testName} - FALLÓ: ${error.message}`);
        await takeScreenshot(driver, 'edit_serie_negative_error');
        reporter.addTest(testName, 'failed', error.message);
    }
}

// Ejecutar pruebas
runSeriesTests();