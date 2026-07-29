import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
app.use(express.static("public"));

app.listen(port,() => {
    console.log(`Server running on port ${port}`);
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/forms", (req, res) => {
    res.render("forms.ejs");
});

// app.post("/submit", (req, res) => {
//     res.render("form.ejs");
// });