const express = require('express');
const router = express.Router();
const database = require('../utils/database');

router.get('/', async (req, res, next) => {
    const db = database.get();

    let books = [];

    const bookDocuments = db.collection('books');
    const snapshot = await bookDocuments.get();
    snapshot.forEach(doc => {
        books.push(Object.assign({
            id: doc.id,
        }, doc.data()));
    });

    res.render('index', {
        title: 'My book notes collection',
        books
    });
});

module.exports = router;
