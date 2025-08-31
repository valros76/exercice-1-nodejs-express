const assert = require('assert'); // Module d'assertion de Node.js
const mongoose = require('mongoose');
const Profile = require('../models/Profile'); // Le modèle de notre profil
describe("Profile logic", function () {
  // Hook pour se connecter à la base de données avant tous les tests
  before(function (done) {
    mongoose.connect("mongodb+srv://webdevoopro_db_user:NextF0rmation42@cluster0.voyjctt.mongodb.net/exercice-1-nodejs")
      .then(() => {
        console.log("Connexion à la base de données réussie pour les tests.");
        done();
      })
      .catch(err => done(err));
  });

  // Hook pour se déconnecter de la base de données après tous les tests
  after(function (done) {
    mongoose.disconnect()
      .then(() => {
        console.log("Déconnexion de la base de données réussie.");
        done();
      })
      .catch(err => done(err));
  });

  // Test pour vérifier que webdevoo.pro@gmail.com soit correct
  it('should return the correct answer for "webdevoo.pro@gmail.com"', async function () {
    const matchingProfile = await Profile.findOne({ email: "webdevoo.pro@gmail.com" }).lean(); // Utilisation de .lean() pour avoir un objet JSON pur
    // Suppression des champs Mongoose supplémentaires pour la comparaison
    delete matchingProfile._id;
    delete matchingProfile.__v;

    // La comparaison avec assert.deepStrictEqual est plus appropriée pour les objets
    assert.deepStrictEqual(matchingProfile, {
      "nom": "Valérian Dufrène",
      "entreprise": "Webdevoo",
      "email": "webdevoo.pro@gmail.com",
      "description": "Gérant de l'entreprise Webdevoo",
      "annee_debut_entreprise": 2019,
      "annee_debut_organisme_formation": 2023
    });
  });

  // Test pour vérifier que si l'email n'existe pas, il n'y a pas de réponse
  it('should not return a response for an unknown email', async function () {
    const matchingProfile = await Profile.findOne({ email: "test@mail.fr" });
    assert.strictEqual(matchingProfile, null);
  });

});