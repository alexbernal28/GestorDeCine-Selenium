import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";

// Configuracion

export const config = {
    baseUrl: 'http://localhost:3000',
    browser: 'chrome',
    implicitWait: 10000,
    screenshotPath: './test-results/screenshots/',
    reportPath: './test-results/reports/',
    timeout: 30000
}

// Instancia del driver

export async function createDriver() {
    let options;

    if (config.browser === 'chrome') {
        options = new chrome.Options();
        options.addArguments('--start-maximized');
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
    } else if (config.browser === 'firefox') {
        options = new firefox.Options();
        options.addArguments('--start-maximized');
    }

    const driver = await new Builder()
        .forBrowser(config.browser)
        .setChromeOptions(config.browser === 'chrome' ? options : undefined)
        .setFirefoxOptions(config.browser === 'firefox' ? options : undefined)
        .build();

    await driver.manage().setTimeouts({ implicit: config.implicitWait });

    return driver;
}

// Funcion para tomar screenshots

export async function takeScreenshot(driver, testName) {
    const screenshot = await driver.takeScreenshot();
    const fs = await import('fs');
    const path = await import('path');

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${testName}_${timestamp}.png`;
    const filepath = path.join(config.screenshotPath, filename);
    
    // Crear directorio si no existe
    if (!fs.existsSync(config.screenshotPath)) {
        fs.mkdirSync(config.screenshotPath, { recursive: true });
    }
    
    fs.writeFileSync(filepath, screenshot, 'base64');
    
    return filepath;
}