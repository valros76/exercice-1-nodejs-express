const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res)=>{
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/a-propos", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "a-propos.html"));
});

app.get("/api/profile", (req, res) => {
  const profile = require(path.join(__dirname, "public", "datas", "profile.json"));
  res.json(profile);
});

app.get("/api/datas/articles", (req, res) => {
  const articles = require(path.join(__dirname, "public", "datas", "articles.json"));

  res.json({
    articles: articles
  });
});

app.get("/api/datas/articles/:articleId", (req, res) => {
  const articleId = Number(req.params.articleId) ?? undefined;
  if(!articleId) res.status(404);
  const articles = require(path.join(__dirname, "public", "datas", "articles.json"));

  res.json({
    article: articles[articleId - 1]
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré et accessible sur http://localhost:${PORT}.`);
});