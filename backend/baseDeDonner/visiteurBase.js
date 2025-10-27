const { Pool } = require('pg');

// Configuration de la connexion à PostgreSQL
const db = new Pool({
    host: 'localhost',
    user: 'postgres', // Remplace par ton utilisateur PostgreSQL
    password: 'postgres1234', // Remplace par ton mot de passe PostgreSQL
    database: 'GARENET', // Nom de ta base de données
    port: 5432 // Port par défaut de PostgreSQL
});

// Test de la connexion
db.connect((err, client, release) => {
    if (err) {
        console.error('Erreur de connexion à la base de données PostgreSQL:', err.stack);
    } else {
        console.info('Connexion à la base de données PostgreSQL réussie !');
        release(); // Libère le client après le test
    }
});

// Exporter la pool
module.exports = db;