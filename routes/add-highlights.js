const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const addBookHandler = require('../utils/add-book-handler');

router.get('/', async (req, res, next) => {
    res.render('add-highlights', {
        title: 'Upload new book notes',
    });
});

router.post('/', async (req, res, next) => {
    const form = new multiparty.Form();
    let language;

    await form.parse(req, async (err, fields, files) => {
        if (!files || files.file.length === 0 || files.file[0].size === 0) {
            res.send('You need to provide a file.');
            return;
        }

        language = fields.language[0];

        await addBookHandler.addBooks(files, language);

        res.redirect('/?response=success');
    });
});

module.exports = router;
