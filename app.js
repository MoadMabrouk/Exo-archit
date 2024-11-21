// Ce qui a été modifié
// Connexion à la base de données encapsulée : La connexion SQLite est maintenant dans une fonction connectToDatabase, ce qui facilite son isolation.
// Routes séparées dans des fonctions dédiées : Les handlers pour GET, POST, PUT, et DELETE ont été extraits en fonctions distinctes (getProducts, createProduct, etc.). Cela améliore la lisibilité.
// Gestion des erreurs centralisée : La fonction handleDatabaseError gère toutes les erreurs de la base de données pour éviter la répétition.
// Ajout de commentaires structurants : Les sections sont clairement séparées (connexion, routes, enregistrement des routes).

// Avantages de ces changements 

// Lisibilité accrue :
// Les handlers de route sont séparés et clairement identifiés.
// Le code est plus organisé et plus compréhensible.

// Réduction de la duplication :
// La gestion des erreurs est centralisée dans une seule fonction.

// Préparation pour une meilleure modularité :
// Même dans un seul fichier, vous vous rapprochez d'une organisation modulaire.

// Aucune rupture fonctionnelle :
// Le fichier fonctionne toujours de la même manière. Aucun changement dans la logique métier.


import express from 'express';
import sqlite3 from 'sqlite3';

// Connexion à la base de données
const connectToDatabase = () => {
    const db = new sqlite3.Database('./products.db', (err) => {
        if (err) {
            console.error('Erreur de connexion à la base de données :', err.message);
        } else {
            console.log('Connexion à la base de données établie.');
        }
    });
    return db;
};

const db = connectToDatabase();

const app = express();
app.use(express.json());

/* ======================
   ROUTES 
=======================*/

// Route GET pour récupérer les produits
const getProducts = (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            handleDatabaseError(res, err);
        } else {
            res.send(rows);
        }
    });
};

// Route POST pour ajouter un produit
const createProduct = (req, res) => {
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).send('Name and price are required');
    }

    const sql = 'INSERT INTO products(name, price) VALUES (?, ?)';
    db.run(sql, [name, price], function (err) {
        if (err) {
            handleDatabaseError(res, err);
        } else {
            res.status(201).send({ id: this.lastID, name, price });
        }
    });
};

// Route PUT pour mettre à jour un produit
const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).send('Name and price are required');
    }

    const sql = 'UPDATE products SET name = ?, price = ? WHERE id = ?';
    db.run(sql, [name, price, id], function (err) {
        if (err) {
            handleDatabaseError(res, err);
        } else if (this.changes === 0) {
            res.status(404).send('Product not found');
        } else {
            res.status(200).send({ id, name, price });
        }
    });
};

// Route DELETE pour supprimer un produit
const deleteProduct = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM products WHERE id = ?';
    db.run(sql, [id], function (err) {
        if (err) {
            handleDatabaseError(res, err);
        } else if (this.changes === 0) {
            res.status(404).send('Product not found');
        } else {
            res.status(204).send();
        }
    });
};

// Gestionnaire d'erreurs pour la base de données
const handleDatabaseError = (res, err) => {
    console.error('Database Error:', err.message);
    res.status(500).send('Internal server error');
};

/* ======================
   ENREGISTREMENT DES ROUTES 
=======================*/

app.get('/products', getProducts);
app.post('/products', createProduct);
app.put('/products/:id', updateProduct);
app.delete('/products/:id', deleteProduct);

export default app;