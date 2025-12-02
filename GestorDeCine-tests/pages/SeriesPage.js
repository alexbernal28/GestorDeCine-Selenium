import { By, until } from 'selenium-webdriver';
import { config } from '../config/selenium.config.js';

export class SeriesPage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = config.baseUrl;
    }

    // LOCALIZADORES
    locators = {
        // Botones principales
        createButton: By.css('a.btn.btn-success[href="/series/create"]'),
        saveButton: By.css('button[type="submit"].btn.btn-success'),
        cancelButton: By.css('a.btn.btn-danger[href="/series/index"]'),
        
        // Campos del formulario
        serieNameInput: By.id('serieName'),
        frontPageInput: By.id('serieFrontPage'),
        youtubeLinkInput: By.id('serieYoutubeLink'),
        genreSelect: By.id('serieGenreId'),
        
        // Elementos de la lista
        serieCards: By.css('.card'),
        serieTitle: (name) => By.xpath(`//h5[contains(@class, "card-title") and text()="${name}"]`),
        
        // Botones de acción en cada card
        editButton: (id) => By.css(`a.btn.btn-outline-warning[href="/series/edit/${id}"]`),
        deleteButton: (id) => By.css(`button[data-bs-target="#confirmationModal-${id}"]`),
        
        // Modal de confirmación
        confirmDeleteButton: By.css('button[type="submit"].btn.btn-danger'),
        modalCancelButton: By.css('button.btn.btn-secondary[data-bs-dismiss="modal"]'),
        
        // Mensajes
        emptyMessage: By.xpath('//div[contains(text(), "No hay ninguna serie registrada")]'),
        noGenresAlert: By.css('.alert.alert-danger')
    };

    // MÉTODOS DE NAVEGACIÓN
    
    // Navegar a la página de índice de series
    async goToIndex() {
        await this.driver.get(`${this.baseUrl}/series/index`);
        await this.driver.sleep(1000);
    }

     // Navegar a la página de crear serie
    async goToCreate() {
        await this.driver.get(`${this.baseUrl}/series/create`);
        await this.driver.sleep(1000);
    }

    /**
     * Navegar a la página de editar serie
     * @param {number} seriesId - ID de la serie a editar
     */
    async goToEdit(seriesId) {
        await this.driver.get(`${this.baseUrl}/series/edit/${seriesId}`);
        await this.driver.sleep(1000);
    }

    // MÉTODOS DE INTERACCIÓN CON EL FORMULARIO
    
    // Hacer clic en el botón "Crear nueva serie"
    async clickCreateButton() {
        const button = await this.driver.findElement(this.locators.createButton);
        await button.click();
        await this.driver.sleep(1000);
    }

    /**
     * Llenar todos los campos del formulario de serie
     * @param {string} name - Nombre de la serie
     * @param {string} frontPage - URL de la imagen de portada
     * @param {string} youtubeLink - URL del video de YouTube
     * @param {number} genreId - ID del género (opcional si se usa selectGenre después)
     */
    async fillSerieForm(name, frontPage, youtubeLink, genreId) {
        // Llenar nombre
        if (name !== null && name !== undefined) {
            const nameInput = await this.driver.findElement(this.locators.serieNameInput);
            await nameInput.clear();
            await nameInput.sendKeys(name);
        }
        
        // Llenar imagen de portada
        if (frontPage !== null && frontPage !== undefined) {
            const frontPageInput = await this.driver.findElement(this.locators.frontPageInput);
            await frontPageInput.clear();
            await frontPageInput.sendKeys(frontPage);
        }
        
        // Llenar enlace de YouTube
        if (youtubeLink !== null && youtubeLink !== undefined) {
            const youtubeInput = await this.driver.findElement(this.locators.youtubeLinkInput);
            await youtubeInput.clear();
            await youtubeInput.sendKeys(youtubeLink);
        }
        
        // Si se proporciona genreId, usar el método selectGenre
        if (genreId !== null && genreId !== undefined) {
            await this.selectGenre(genreId);
        }
    }

    /**
     * Seleccionar un género del dropdown
     * @param {number} genreId - ID del género a seleccionar
     */
    async selectGenre(genreId) {
        const select = await this.driver.findElement(this.locators.genreSelect);
        const options = await select.findElements(By.css('option'));
        
        for (let option of options) {
            const value = await option.getAttribute('value');
            if (value === genreId.toString()) {
                await option.click();
                await this.driver.sleep(300);
                break;
            }
        }
    }

    // Hacer clic en el botón "Guardar"

    async clickSaveButton() {
        const button = await this.driver.findElement(this.locators.saveButton);
        await button.click();
        await this.driver.sleep(1000);
    }

    // Hacer clic en el botón "Cancelar"

    async clickCancelButton() {
        const button = await this.driver.findElement(this.locators.cancelButton);
        await button.click();
        await this.driver.sleep(500);
    }

    // MÉTODOS DE OPERACIONES COMPLETAS (CRUD)
    
    /**
     * Crear una serie completa (navegación + llenado + guardado)
     * @param {string} name - Nombre de la serie
     * @param {string} frontPage - URL de la imagen
     * @param {string} youtubeLink - URL de YouTube
     * @param {number} genreId - ID del género
     */
    async createSerie(name, frontPage, youtubeLink, genreId) {
        await this.goToCreate();
        await this.fillSerieForm(name, frontPage, youtubeLink, null);
        await this.selectGenre(genreId);
        await this.clickSaveButton();
    }

    /**
     * Editar una serie existente
     * @param {number} seriesId - ID de la serie
     * @param {string} name - Nuevo nombre (null para no cambiar)
     * @param {string} frontPage - Nueva imagen (null para no cambiar)
     * @param {string} youtubeLink - Nuevo link (null para no cambiar)
     * @param {number} genreId - Nuevo género (null para no cambiar)
     */
    async editSerie(seriesId, name, frontPage, youtubeLink, genreId) {
        await this.goToEdit(seriesId);
        await this.fillSerieForm(name, frontPage, youtubeLink, null);
        
        if (genreId !== null && genreId !== undefined) {
            await this.selectGenre(genreId);
        }
        
        await this.clickSaveButton();
    }

    /**
     * Eliminar una serie (con confirmación)
     * @param {number} seriesId - ID de la serie a eliminar
     */
    async deleteSerie(seriesId) {
        await this.goToIndex();
        
        // Hacer clic en el botón eliminar
        const deleteButton = await this.driver.findElement(this.locators.deleteButton(seriesId));
        await deleteButton.click();
        
        // Esperar que aparezca el modal
        await this.driver.sleep(500);
        
        // Confirmar eliminación
        const confirmButton = await this.driver.findElement(this.locators.confirmDeleteButton);
        await confirmButton.click();
        
        // Esperar redirección
        await this.driver.sleep(1000);
    }

    //Cancelar la eliminación de una serie

    async cancelDelete() {
        const cancelButton = await this.driver.findElement(this.locators.modalCancelButton);
        await cancelButton.click();
        await this.driver.sleep(500);
    }

    // MÉTODOS DE VERIFICACIÓN Y CONSULTA
    
    /**
     * Verificar si una serie está visible en la lista por su nombre
     * @param {string} name - Nombre de la serie
     * @returns {boolean} - true si está visible, false si no
     */
    async isSerieInList(name) {
        try {
            await this.driver.findElement(this.locators.serieTitle(name));
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtener la cantidad de series en la lista
     * @returns {number} - Cantidad de cards de series
     */
    async getSerieCount() {
        try {
            const isEmpty = await this.isListEmpty();
            if (isEmpty) return 0;
            
            const cards = await this.driver.findElements(this.locators.serieCards);
            return cards.length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Verificar si la lista está vacía
     * @returns {boolean} - true si está vacía
     */
    async isListEmpty() {
        try {
            await this.driver.findElement(this.locators.emptyMessage);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Verificar si se muestra la alerta de "no hay géneros"
     * @returns {boolean} - true si se muestra la alerta
     */
    async hasNoGenresAlert() {
        try {
            await this.driver.findElement(this.locators.noGenresAlert);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtener la URL actual
     * @returns {string} - URL actual del navegador
     */
    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }

    /**
     * Obtener el valor actual del campo nombre
     * @returns {string} - Valor del input de nombre
     */
    async getSerieNameFromInput() {
        const input = await this.driver.findElement(this.locators.serieNameInput);
        return await input.getAttribute('value');
    }

    /**
     * Obtener el valor actual del campo imagen de portada
     * @returns {string} - Valor del input de imagen
     */
    async getFrontPageFromInput() {
        const input = await this.driver.findElement(this.locators.frontPageInput);
        return await input.getAttribute('value');
    }

    /**
     * Obtener el valor actual del campo enlace de YouTube
     * @returns {string} - Valor del input de YouTube
     */
    async getYoutubeLinkFromInput() {
        const input = await this.driver.findElement(this.locators.youtubeLinkInput);
        return await input.getAttribute('value');
    }

    /**
     * Obtener el ID del género seleccionado
     * @returns {string} - ID del género seleccionado
     */
    async getSelectedGenreId() {
        const select = await this.driver.findElement(this.locators.genreSelect);
        const selectedOption = await select.findElement(By.css('option:checked'));
        return await selectedOption.getAttribute('value');
    }

    /**
     * Verificar si el formulario está pre-poblado (modo edición)
     * @returns {boolean} - true si hay datos en los campos
     */
    async isFormPrePopulated() {
        const name = await this.getSerieNameFromInput();
        const frontPage = await this.getFrontPageFromInput();
        const youtubeLink = await this.getYoutubeLinkFromInput();
        
        return name !== '' && frontPage !== '' && youtubeLink !== '';
    }

    /**
     * Obtener todos los títulos de series visibles
     * @returns {Array<string>} - Array con los nombres de las series
     */
    async getAllSeriesTitles() {
        const titles = [];
        try {
            const cards = await this.driver.findElements(this.locators.serieCards);
            
            for (let card of cards) {
                const titleElement = await card.findElement(By.css('h5.card-title'));
                const title = await titleElement.getText();
                titles.push(title);
            }
        } catch (error) {
            console.error('Error getting series titles:', error);
        }
        return titles;
    }

    /**
     * Hacer clic en el botón editar de una serie específica
     * @param {number} seriesId - ID de la serie
     */
    async clickEditButton(seriesId) {
        const button = await this.driver.findElement(this.locators.editButton(seriesId));
        await button.click();
        await this.driver.sleep(1000);
    }

    /**
     * Hacer clic en el botón eliminar de una serie específica
     * @param {number} seriesId - ID de la serie
     */
    async clickDeleteButton(seriesId) {
        const button = await this.driver.findElement(this.locators.deleteButton(seriesId));
        await button.click();
        await this.driver.sleep(500);
    }

    // MÉTODOS DE VALIDACIÓN
    
    /**
     * Verificar si un campo específico tiene error de validación HTML5
     * @param {string} fieldName - 'name', 'frontPage', 'youtubeLink', o 'genre'
     * @returns {boolean} - true si tiene error de validación
     */
    async hasValidationError(fieldName) {
        try {
            let input;
            
            switch(fieldName) {
                case 'name':
                    input = await this.driver.findElement(this.locators.serieNameInput);
                    break;
                case 'frontPage':
                    input = await this.driver.findElement(this.locators.frontPageInput);
                    break;
                case 'youtubeLink':
                    input = await this.driver.findElement(this.locators.youtubeLinkInput);
                    break;
                case 'genre':
                    input = await this.driver.findElement(this.locators.genreSelect);
                    break;
                default:
                    return false;
            }
            
            // Verificar validación del input de HTML5
            const isValid = await this.driver.executeScript(
                'return arguments[0].checkValidity();',
                input
            );
            
            return !isValid;
            
        } catch (error) {
            return false;
        }
    }

    /**
     * Verificar si el botón guardar está habilitado
     * @returns {boolean} - true si está habilitado
     */
    async isSaveButtonEnabled() {
        try {
            const button = await this.driver.findElement(this.locators.saveButton);
            const isEnabled = await button.isEnabled();
            return isEnabled;
        } catch (error) {
            return false;
        }
    }
}