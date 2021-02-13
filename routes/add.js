const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const bookGuesser = require('../utils/book-guesser');
const addBookHandler = require('../utils/add-book-handler');

router.get('/', async (req, res, next) => {
    if (!req.user) {
        return;
    }

    res.render('add', {
        title: 'Upload new book notes',
    });
});

router.post('/', async (req, res, next) => {
    if (!req.user) {
        return;
    }

    const form = new multiparty.Form();

    await form.parse(req, async (err, fields, files) => {
        let language = fields.language[0];
        let bookName = fields.name[0];
        let bookAuthor = fields.author[0];

        book = {
            title: bookName,
            author: bookAuthor,
            highlights: [],
        };

        const volumeInfo = await bookGuesser.guessBook(book, language);

        await addBookHandler.createVolumeInDatabase(volumeInfo, book);

        res.redirect('/?response=success');
    });
});

module.exports = router;
