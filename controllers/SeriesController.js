import seriesModel from "../models/SeriesModel.js";
import GenresModel from "../models/GenreModel.js";

export function GetIndex(req, res, next) {
    seriesModel.GetAll((series) => {
        GenresModel.GetAll((genres) => {
            res.render("series/index", {
                title: "Series",
                seriesList: series,
                hasseries: series.length > 0,
                genresList: genres
            });
        });
    });
}

export function GetCreate(req, res, next) {
    GenresModel.GetAll((genres) => {
        res.render("series/save", {
            editmode: false,
            genresList: genres,
            title: "Crear serie"
        });
    });
}

export function PostCreate(req, res, next) {
    const name = req.body.Name;
    const frontPage = req.body.FrontPage;
    const youtubeLink = req.body.YoutubeLink;
    const genreId = req.body.GenreId;

    const serie = new seriesModel(
        0,
        name,
        frontPage,
        youtubeLink,
        Number(genreId)
    );

    serie.Save();
    res.redirect("/series/index");
}

export function GetEdit(req, res, next) {
    const id = req.params.seriesId;

    seriesModel.GetById(id, (serie) => {
        GenresModel.GetAll((genres) => {
            if (!serie) {
                return res.redirect("/series/index");
            }
            res.render("series/save", {
                editmode: true,
                serie: serie,
                genresList: genres,
                title: "Editar serie"
            });
        });
    });
}

export function PostEdit(req, res, next) {
    const id = req.body.serieId;
    const name = req.body.Name;
    const frontPage = req.body.FrontPage;
    const youtubeLink = req.body.YoutubeLink;
    const genreId = req.body.GenreId;

    const serie = new seriesModel(
        Number(id),
        name,
        frontPage,
        youtubeLink,
        Number(genreId)
    )

    serie.Save();
    res.redirect("/series/index");
}

export function PostDelete(req, res, next) {
    const id = req.body.serieId;

    seriesModel.Delete(id, () => {
        res.redirect("/series/index");
    });
}