import GenresModel from "../models/GenreModel.js";

export function GetIndex(req, res, next) {
    GenresModel.GetAll((genres) => {
        res.render("genre/index", {
            title: "Géneros cinematográficos",
            genresList: genres,
            hasGenres: genres.length > 0
        });
    });
}

export function GetCreate(req, res, next) {
    res.render("genre/save", {
        editmode: false,
        title: "Crear género cinematográfico"
    });
}

export function PostCreate(req, res, next) {
    const name = req.body.Name;

    const genre = new GenresModel(
        0,
        name
    );

    genre.Save();
    res.redirect("/genre/index");
}

export function GetEdit(req, res, next) {
    const id = req.params.genreId;

    GenresModel.GetById(id, (genre) => {
        if (!genre) {
            return res.redirect("/genre/index");
        }
        res.render("genre/save", {
            editmode: true,
            genre: genre,
            title: "Editar género cinematográfico"
        });
    });
}

export function PostEdit(req, res, next) {
    const id = req.body.genreId;
    const name = req.body.Name;

    const genre = new GenresModel(
        Number(id),
        name
    )

    genre.Save();
    res.redirect("/genre/index");
}

export function PostDelete(req, res, next) {
    const id = req.body.GenreId;

    GenresModel.Delete(id, () => {
        res.redirect("/genre/index");
    });
}