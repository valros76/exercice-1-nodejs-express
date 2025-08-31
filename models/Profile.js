const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  nom: String,
  entreprise: String,
  email: String,
  description: String,
  annee_debut_entreprise: Number,
  annee_debut_organisme_formation: Number
});

module.exports = mongoose.model("Profile", profileSchema, "profile");