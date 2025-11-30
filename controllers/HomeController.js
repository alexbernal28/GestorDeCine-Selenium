import SeriesModel from "../models/SeriesModel.js";
import GenresModel from "../models/GenreModel.js";

export function GetIndex(req, res, next) {
    const name = req.query.name || null;
    const genreId = req.query.genreId || null;

    SeriesModel.SeriesFilter(name, genreId, (seriesFiltered) => {
        GenresModel.GetAll((genres) => {
            res.render("home/index", {
                title: "Home",
                seriesList: seriesFiltered,
                hasseries: seriesFiltered.length > 0,
                genresList: genres,
                selectedName: name,
                selectedGenre: genreId
            });
        });
    });
}

export function PostFilter(req, res, next) {
    const name = req.body.Name;
    const genreId = req.body.GenreId;

    res.redirect(`/home?name=${encodeURIComponent(name)}&genreId=${encodeURIComponent(genreId)}`);
}