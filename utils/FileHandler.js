import fs from "fs";

export function GetAllDataFromFile(dataPath, callback) {
    fs.readFile(dataPath, function (err, data) {
        if (err) {
            callback([]);
        }
        else {
            callback(JSON.parse(data));
        }
    });
}

export function SaveDataInFile(dataPath, data) {
    fs.writeFile(dataPath, JSON.stringify(data), (err, data) => {
        if (err) {
            console.error("Error saving data:", err);
        }
    });
}