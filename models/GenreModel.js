import path from "path";
import { projectRoot } from "../utils/paths.js";
import {GetAllDataFromFile, SaveDataInFile} from "../utils/FileHandler.js";

const dataPath = path.join(projectRoot, "data", "genre.json");

class Genres {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static GetById(id, callback) {
        GetAllDataFromFile(dataPath, (genres) => {
            const genre = genres.find((genre) => genre.id === Number(id));
            if (genre) {
                callback(genre);
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
        GetAllDataFromFile(dataPath, (genres) => {
            if (this.id !== 0) {
                const editGenre = genres.findIndex(
                    (genre) => genre.id === Number(this.id)
                );
                genres[editGenre] = this;
                SaveDataInFile(dataPath, genres);
            }
            else {
                this.id = genres.length + 1;
                genres.push(this);
                SaveDataInFile(dataPath, genres);
            }
        });
    }

    static Delete(id, callback) {
        GetAllDataFromFile(dataPath, (genres) => {
            const newGenres = genres.filter((genre) => genre.id !== Number(id));
            SaveDataInFile(dataPath, newGenres);

            if (callback) callback();
        });
    }
}

export default Genres;