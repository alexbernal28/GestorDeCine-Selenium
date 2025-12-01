import express from "express";
import { engine } from "express-handlebars";
import { projectRoot } from "./utils/paths.js";
import path from "path";
import genresRouter from "./routes/genres-router.js";
import seriesRouter from "./routes/series-router.js";
import homeRouter from "./routes/home-router.js"
import { getGenreName, eq, replace } from "./helpers/hbs/helper.js";

const app = express();

app.engine("hbs", engine({
    layoutsDir: "views/layouts",
    defaultLayout: "layout",
    extname: "hbs",
    helpers: {
        eq,
        getGenreName,
        replace
    }
}));

app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.urlencoded());
app.use(express.static(path.join(projectRoot, "public")));

app.use("/genre", genresRouter);

app.use("/series", seriesRouter);

app.use('/', homeRouter);
app.use('/home', homeRouter);

app.use((req, res) => {
    res.status(404).render("404", { title: "Error 404" });
})

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})