const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const database = require('../utils/database');
const googleBooks = require('../utils/google-books')

router.get('/', async function (req, res, next) {
    res.render('add', {
        title: 'Upload a new book',
    });
});

router.post('/', function (req, res, next) {
    var form = new multiparty.Form();
    book = {
        title: '',
        author: '',
        hightlights: [],
    };

    form.parse(req, function(err, fields, files) {
        if (
            !files ||
            files.file.length === 0 ||
            files.file[0].size === 0
        ) {
            res.send('You need to provide a file.');
            return;
        }

        const file = files.file[0];
        let index = 0;
        fs
            .createReadStream(file.path)
            .pipe(csv({
                headers: ['type', 'location', 'marked', 'annotation'],
            }))
            .on('data', data => {
                if (index < 8) {
                    handleHeaderRow(data, index);
                } else {
                    handleBodyRow(data);
                }

                index++;
            })
            .on('end', async () => {
                const googleSearchResult = await googleBooks.searchFirstResult(book.title);

                if (!googleSearchResult) {
                    throw Error('stop');
                }
                const volumeInfo = googleSearchResult.volumeInfo;

                const db = database.get();

                const bookDocument = db.collection('books').doc(uuidv4());
                await bookDocument.set({
                    title: volumeInfo.title,
                    authors: volumeInfo.authors,
                    publishedDate: volumeInfo.publishedDate,
                    categories: volumeInfo.categories,
                    imageLinks: volumeInfo.imageLinks,
                    hightlights: book.hightlights,
                });

                res.redirect('/add');
            })
        ;
    });
});

let book = {
    title: '',
    author: '',
    hightlights: [],
};

const HIGHLIGHT_TYPE_HIGHLIGHT = 'highlight';
const HIGHLIGHT_TYPE_NOTE = 'note';

const handleHeaderRow = (row, index) => {
    switch (index) {
        case 1:
            // title
            book.title = row.type;
            break;
        case 2:
            // author
            book.author = row.type.substr(3);
            break;
        default:
    }
}

const handleBodyRow = (row) => {
    book.hightlights.push({
        type: row.type === 'Evidenziazione (Giallo)' ? HIGHLIGHT_TYPE_HIGHLIGHT : HIGHLIGHT_TYPE_NOTE,
        location: row.location.substr(row.location.indexOf(' ') + 1),
        marked: row.marked !== '',
        annotation: row.annotation,
    });
}

module.exports = router;
