import path from "path";
import { projectRoot } from "../utils/paths.js";
import { GetAllDataFromFile, SaveDataInFile } from "../utils/FileHandler.js";

const dataPath = path.join(projectRoot, "data", "series.json");

class Series {
    constructor(id, name, frontPage, youtubeLink, genreId) {
        this.id = id;
        this.name = name;
        this.frontPage = frontPage;
        this.youtubeLink = youtubeLink;
        this.genreId = genreId;
    }

    static GetById(id, callback) {
        GetAllDataFromFile(dataPath, (series) => {
            const serie = series.find((serie) => serie.id === Number(id));
            if (serie) {
                callback(serie);
            }
            else {
                callback(null)
            }
        });
    }

    static GetAll(callback) {
        GetAllDataFromFile(dataPath, callback);
    }

    Save() {
        GetAllDataFromFile(dataPath, (series) => {
            if (this.id !== 0) {
                const editserie = series.findIndex(
                    (serie) => serie.id === Number(this.id)
                );
                series[editserie] = this;
                SaveDataInFile(dataPath, series);
            }
            else {
                this.id = series.length + 1;
                series.push(this);
                SaveDataInFile(dataPath, series);
            }
        });
    }

    static Delete(id, callback) {
        GetAllDataFromFile(dataPath, (series) => {
            const newseries = series.filter((serie) => serie.id !== Number(id));

            SaveDataInFile(dataPath, newseries);

            if (callback) callback();
        });
    }

    static SeriesFilter(name = null, genreId = null, callback) {
        GetAllDataFromFile(dataPath, (series) => {
            let filteredSeries = series;

            if (name) {
                const searchText = name.toLowerCase();
                filteredSeries = filteredSeries.filter((serie) =>
                    serie.name.toLowerCase().startsWith(searchText)
                );
            }

            if (genreId) {
                filteredSeries = filteredSeries.filter((serie) =>
                    serie.genreId === Number(genreId)
                );
            }

            if (filteredSeries.length > 0) {
                callback(filteredSeries);
            } else {
                callback([]);
            }
        });
    }
}

export default Series;