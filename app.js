const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http"); // On importe le module HTTP pour socket.io
const { Server } = require("socket.io"); // On importe la classe Server de socket.io
const Profile = require("./models/Profile");
// On utilise la librairie dotenv pour protéger nos configurations dans un fichier .env, à la racine du projet (Attention, pensez bien à vérifier que le fichier est bien exclu de vos exports sur des plateformes comme github ou gitlab).
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

// On autorise le sevreur à lire les données Json via Express
app.use(express.json());

// On créé un serveur socket.io à partir de app, qui contient notre instance du serveur Express
const server = http.createServer(app);
// On attache socket.io au serveur HTTP
const io = new Server(server);

// On modifie l'argument de mangoose.connect() par notre variable d'environnement, pour éviter d'exposer des informations sensibles, comme le mot de passe de la base de données.
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à la base de donnée réussie."))
  .catch(err => console.error("Une erreur s'est produite lors de la connexion à la base de données", err));

// Routes de l'application
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/a-propos", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "a-propos.html"));
});

app.get("/profile", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "profile.html"));
});

app.get("/api/profile", (req, res) => {
  const profile = require(path.join(__dirname, "public", "datas", "profile.json"));
  res.json({
    message: "Ces données sont des données de démonstration pour l'affichage d'un profil.",
    profile: profile
  });
});

app.post("/api/profile", async (req, res) => {
  const email = req.body.email.toLowerCase();
  let result = {
    profile: {},
    message: "Pas de profil correspondant."
  };

  try {
    const matchingProfile = await Profile.findOne({ email: email });
    if (matchingProfile) {
      result = {
        profile: matchingProfile,
        message: "Un profil a été trouvé."
      };
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      error: `Une erreur s'est produite lors de la tentative de récupération d'un profil : ${err}.`
    });
  }
});

app.get("/api/datas/articles", (req, res) => {
  const articles = require(path.join(__dirname, "public", "datas", "articles.json"));

  res.json({
    articles: articles
  });
});

app.get("/api/datas/articles/:articleId", (req, res) => {
  const articleId = Number(req.params.articleId) ?? undefined;
  if (!articleId) res.status(404);

  const articles = require(path.join(__dirname, "public", "datas", "articles.json"));
  res.json({
    article: articles[articleId - 1]
  });
});

app.get("/api/init", async (req, res) => {
  try {
    // On supprime les données stockées dans la base de données
    await Profile.deleteMany({});

    // On réinitialise les données dans la base de données, en les ajoutant de nouveau
    await Profile.insertMany([
      {
        "nom": "Valérian Dufrène",
        "entreprise": "Webdevoo",
        "email": "webdevoo.pro@gmail.com",
        "description": "Gérant de l'entreprise Webdevoo",
        "annee_debut_entreprise": 2019,
        "annee_debut_organisme_formation": 2023
      }
    ]);

    res.status(200).json({
      message: "Les données de la base de données ont été réinitialisées."
    });
  } catch (err) {
    res.status(500).json({
      error: `Une erreur s'est produite : ${err}`
    });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// On écoute les connexions WebSocket
io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté.");

  socket.on("search profile", async (formData) => {
    // Si on utilise un formData sur le fichier HTML, il faut utiliser : 
    // const email = formData.email.trim().toLowerCase();
    const email = formData.trim().toLowerCase();
    let result = {
      profile: {},
      message: "Pas de profil correspondant."
    };

    try {
      const matchingProfile = await Profile.findOne({ email: email });
      if (matchingProfile) {
        result = {
          profile: matchingProfile,
          message: "Un profil a été trouvé."
        };
      }
    } catch (err) {
      console.error(`Erreur de la base de données : ${err}.`);
      res.status(500).json({
        error: `Une erreur s'est produite lors de la tentative de récupération d'un profil : ${err}.`
      });
    }

    socket.emit("search profile", result);
  });

  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté.");
  });
});

// app.listen(PORT, () => {
//   console.log(`Serveur démarré et accessible sur http://localhost:${PORT}.`);
// });

// On change app.listen en server.listen, pour s'assurer que ce soit bien le serveur socket.io qui attrape les requêtes HTTP.
// Il faudra également penser à inclure la bibliothèque socket.io sur les fichiers utilisant la connexion, comme profile.html, sur ce projet.
server.listen(PORT, () => {
  console.log(`Serveur démarré et accessible sur http://localhost:${PORT}.`);
});