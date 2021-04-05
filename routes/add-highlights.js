const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const addBookHandler = require('../utils/add-book-handler');

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
        if (!files || files.file.length === 0 || files.file[0].size === 0) {
            res.send('You need to provide a file.');
            return;
        }

        language = fields.language[0];

        const books = await addBookHandler.addBook(files.file[0], language);

        res.render('add-highlights', {
            title: 'Upload new book notes',
            books
        });
        // res.redirect('/?response=success');
    });
});

module.exports = router;
