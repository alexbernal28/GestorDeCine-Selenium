import { By, until } from 'selenium-webdriver';
import { config } from '../config/selenium.config.js';

export class HomePage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = config.baseUrl;
    }

    // Localizadores
    locators = {
        nameFilterInput: By.css('input[name="Name"]'),
        genreFilterSelect: By.css('select[name="GenreId"]'),
        filterButton: By.css('button[type="submit"].btn.btn-outline-success'),
        serieCards: By.css('.card'),
        serieTitle: (name) => By.xpath(`//h5[contains(@class, "card-title") and contains(text(), "${name}")]`),
        emptyMessage: By.xpath('//div[contains(text(), "No hay ninguna serie registrada")]'),
        detailButton: (id) => By.css(`button[data-bs-target="#detailsModal-${id}"]`),
        modal: (id) => By.id(`detailsModal-${id}`),
        modalCloseButton: By.css('button.btn.btn-success[data-bs-dismiss="modal"]')
    };

    // Métodos de navegación
    async goToHome() {
        await this.driver.get(`${this.baseUrl}/`);
        await this.driver.sleep(1000);
    }

    // Métodos de interacción con filtros
    async fillNameFilter(name) {
        const input = await this.driver.findElement(this.locators.nameFilterInput);
        await input.clear();
        if (name) {
            await input.sendKeys(name);
        }
    }

    async selectGenreFilter(genreId) {
        const select = await this.driver.findElement(this.locators.genreFilterSelect);
        const options = await select.findElements(By.css('option'));
        
        for (let option of options) {
            const value = await option.getAttribute('value');
            if (value === (genreId ? genreId.toString() : '')) {
                await option.click();
                break;
            }
        }
    }

    async clickFilterButton() {
        const button = await this.driver.findElement(this.locators.filterButton);
        await button.click();
        await this.driver.sleep(1000);
    }

    async applyFilter(name = null, genreId = null) {
        if (name !== null) {
            await this.fillNameFilter(name);
        }
        if (genreId !== null) {
            await this.selectGenreFilter(genreId);
        }
        await this.clickFilterButton();
    }

    async clearFilters() {
        await this.fillNameFilter('');
        await this.selectGenreFilter(null);
        await this.clickFilterButton();
    }

    // Métodos de verificación
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

    async isSerieVisible(name) {
        try {
            const element = await this.driver.findElement(this.locators.serieTitle(name));
            return await element.isDisplayed();
        } catch (error) {
            return false;
        }
    }

    async isListEmpty() {
        try {
            await this.driver.findElement(this.locators.emptyMessage);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getAllVisibleSeriesTitles() {
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

    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }

    async getNameFilterValue() {
        const input = await this.driver.findElement(this.locators.nameFilterInput);
        return await input.getAttribute('value');
    }

    async getSelectedGenre() {
        const select = await this.driver.findElement(this.locators.genreFilterSelect);
        const selectedOption = await select.findElement(By.css('option:checked'));
        return await selectedOption.getAttribute('value');
    }
}