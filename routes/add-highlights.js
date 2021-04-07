const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const addBookHandler = require('../utils/add-book-handler');
const addDraftBookHandler = require('../utils/add-draft-book-handler');
const bookGuesser = require('../utils/book-guesser');


router.get('/', async (req, res, next) => {
    // if (!req.user) {
    //     return;
    // }

    res.render('add-highlights', {
        title: 'Upload new book notes',
    });
});

router.post('/', async (req, res, next) => {
    // if (!req.user) {
    //     return;
    // }

    const form = new multiparty.Form();
    let language;

    await form.parse(req, async (err, fields, files) => {
        language = fields.language[0];

        if (!fields.book) {
            if (!files || files.file.length === 0 || files.file[0].size === 0) {
                res.send('You need to provide a file.');
                return;
            }

            const draftBook = await addDraftBookHandler.addDraftBook(files.file[0]);
            const books = await bookGuesser.guessBookList(draftBook, language);

            res.render('add-highlights', {
                title: 'Upload new book notes',
                books,
                files,
                draftBookId: draftBook.id,
            });

            return;
        }

        const bookIsbn = fields.book[0];
        const draftBookId = fields.draftBookId[0];
        const books = await addBookHandler.addBook(draftBookId, bookIsbn);

        res.redirect('/?response=success');
    });
});

module.exports = router;
