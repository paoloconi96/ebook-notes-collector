const express = require('express');
const router = express.Router();
const database = require('../utils/database');
const { validate: uuidValidate } = require('uuid');

router.get('/:bookId', async (req, res, next) => {
    // Validate parameters
    const bookId = req.params.bookId
    if (!uuidValidate(bookId)) {
        return res.redirect('/?error=uuid-invalid');
    }

    // Get data from the database and validate it
    const db = database.get();

    const bookDocuments = db.collection('books').doc(bookId);
    const snapshot = await bookDocuments.get();

    if (!snapshot.exists) {
        return res.redirect('/?error=not-found');
    }

    // Compute and render data
    const book = snapshot.data();
    book.id = bookId;

    res.render('detail', {
        title: 'My book notes collection',
        book,
        authenticated: !!req.user,
    });
});

router.get('/:bookId/delete', async (req, res, next) => {
    if (!req.user) {
        return;
    }

    // Validate parameters
    const bookId = req.params.bookId
    if (!uuidValidate(bookId)) {
        return res.redirect('/?error=uuid-invalid');
    }

    // Get data from the database and validate it
    const db = database.get();

    const bookDocuments = db.collection('books').doc(bookId);
    const snapshot = await bookDocuments.delete();

    if (!snapshot.exists) {
        return res.redirect('/?error=not-found');
    }

    res.redirect('/detail/' + bookId);
});

module.exports = router;
