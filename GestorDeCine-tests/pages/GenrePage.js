import { By, until } from 'selenium-webdriver';
import { config } from '../config/selenium.config.js';

export class GenrePage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = config.baseUrl;
    }

    // Localizadores
    locators = {
        createButton: By.css('a.btn.btn-success[href="/genre/create"]'),
        genreNameInput: By.id('genreName'),
        saveButton: By.css('button[type="submit"].btn.btn-success'),
        cancelButton: By.css('a.btn.btn-danger[href="/genre/index"]'),
        tableRows: By.css('tbody tr'),
        genreName: (name) => By.xpath(`//td[text()="${name}"]`),
        editButton: (id) => By.css(`a.btn.btn-outline-warning[href="/genre/edit/${id}"]`),
        deleteButton: (id) => By.css(`button[data-bs-target="#confirmationModal-${id}"]`),
        confirmDeleteButton: By.css('button[type="submit"].btn.btn-danger'),
        modalCancelButton: By.css('button.btn.btn-secondary[data-bs-dismiss="modal"]'),
        emptyMessage: By.xpath('//td[contains(text(), "No hay géneros cinematográficos registrados")]')
    };

    // Métodos de navegación
    async goToIndex() {
        await this.driver.get(`${this.baseUrl}/genre/index`);
        await this.driver.wait(until.elementLocated(this.locators.createButton), 5000);
    }

    async goToCreate() {
        await this.driver.get(`${this.baseUrl}/genre/create`);
        await this.driver.wait(until.elementLocated(this.locators.genreNameInput), 5000);
    }

    async goToEdit(genreId) {
        await this.driver.get(`${this.baseUrl}/genre/edit/${genreId}`);
        await this.driver.wait(until.elementLocated(this.locators.genreNameInput), 5000);
    }

    // Métodos de interacción
    async clickCreateButton() {
        const button = await this.driver.findElement(this.locators.createButton);
        await button.click();
        await this.driver.wait(until.elementLocated(this.locators.genreNameInput), 5000);
    }

    async fillGenreName(name) {
        const input = await this.driver.findElement(this.locators.genreNameInput);
        await input.clear();
        await input.sendKeys(name);
    }

    async clickSaveButton() {
        const button = await this.driver.findElement(this.locators.saveButton);
        await button.click();
        // Esperar redirección
        await this.driver.sleep(1000);
    }

    async clickCancelButton() {
        const button = await this.driver.findElement(this.locators.cancelButton);
        await button.click();
    }

    async createGenre(name) {
        await this.goToCreate();
        await this.fillGenreName(name);
        await this.clickSaveButton();
    }

    async editGenre(genreId, newName) {
        await this.goToEdit(genreId);
        await this.fillGenreName(newName);
        await this.clickSaveButton();
    }

    async deleteGenre(genreId) {
        await this.goToIndex();
        const deleteButton = await this.driver.findElement(this.locators.deleteButton(genreId));
        await deleteButton.click();
        
        // Esperar que aparezca el modal
        await this.driver.sleep(500);
        
        const confirmButton = await this.driver.findElement(this.locators.confirmDeleteButton);
        await confirmButton.click();
        
        // Esperar redirección
        await this.driver.sleep(1000);
    }

    async cancelDelete() {
        const cancelButton = await this.driver.findElement(this.locators.modalCancelButton);
        await cancelButton.click();
    }

    // Métodos de verificación
    async isGenreInList(name) {
        try {
            await this.driver.findElement(this.locators.genreName(name));
            return true;
        } catch (error) {
            return false;
        }
    }

    async getGenreCount() {
        try {
            const rows = await this.driver.findElements(this.locators.tableRows);
            // Verificar si hay mensaje de vacío
            const isEmpty = await this.isTableEmpty();
            return isEmpty ? 0 : rows.length;
        } catch (error) {
            return 0;
        }
    }

    async isTableEmpty() {
        try {
            await this.driver.findElement(this.locators.emptyMessage);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getGenreNameFromInput() {
        const input = await this.driver.findElement(this.locators.genreNameInput);
        return await input.getAttribute('value');
    }

    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }
}