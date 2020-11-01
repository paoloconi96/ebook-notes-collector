const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const database = require('../utils/database');
const googleBooks = require('../utils/google-books')

var books = require('google-books-search');

router.get('/', async function (req, res, next) {
    res.render('add', {
        title: 'Upload new book notes',
    });
});

router.post('/', function (req, res, next) {
    const form = new multiparty.Form();
    let language;

    form.parse(req, function(err, fields, files) {
        if (!files || files.file.length === 0 || files.file[0].size === 0) {
            res.send('You need to provide a file.');
            return;
        }

        language = fields.language[0];

        files.file.forEach(file => {
            const book = {
                title: '',
                author: '',
                hightlights: [],
            };

            let index = 0;
            fs
                .createReadStream(file.path)
                .pipe(csv({
                    headers: ['type', 'location', 'marked', 'annotation'],
                }))
                .on('data', data => {
                    if (index < 8) {
                        handleHeaderRow(data, index, book);
                    } else {
                        handleBodyRow(data, book);
                    }

                    index++;
                })
                .on('end', async () => {
                    // Maybe data is already sorted?
                    book.hightlights = book.hightlights.sort((a, b) => {
                        if (a < b) {
                            return -1;
                        }

                        if (a > b) {
                            return 1;
                        }

                        return 0;
                    });

                    books.search(book.title.substr(0, 25), {
                        field: 'title',
                        type: 'books',
                        lang: language,
                    }, async (error, booksByTitle) => {
                        if ( ! error ) {
                            books.search(book.author, {
                                field: 'author',
                                type: 'books',
                                lang: language,
                            }, async (error, booksByAuthor) => {
                                if ( ! error ) {
                                    let googleBook;

                                    for (let i = booksByTitle.length - 1; i >= 0; i--) {
                                        for (let j = booksByAuthor.length - 1; j >= 0; j--) {
                                            if (booksByTitle[i].id === booksByAuthor[j].id) {
                                                googleBook = booksByTitle[i];
                                            }
                                        }
                                    }

                                    if (!googleBook) {
                                        googleBook = booksByAuthor.length ? booksByAuthor[0] : booksByTitle[0];
                                    }

                                    const volumeInfo = googleBook;
                                    const db = database.get();

                                    const bookDocument = db.collection('books').doc(uuidv4());
                                    await bookDocument.set({
                                        title: volumeInfo.title,
                                        authors: volumeInfo.authors,
                                        publishedDate: volumeInfo.publishedDate,
                                        categories: volumeInfo.categories ? volumeInfo.categories : null,
                                        imageLinks: volumeInfo.thumbnail ? volumeInfo.thumbnail : null,
                                        hightlights: book.hightlights,
                                    });
                                } else {
                                    console.log(error);
                                }
                            });
                        } else {
                            console.log(error);
                        }
                    });
                })
            ;

            // res.redirect('/');
        })
    });
});

const HIGHLIGHT_TYPE_HIGHLIGHT = 'highlight';
const HIGHLIGHT_TYPE_NOTE = 'note';

const handleHeaderRow = (row, index, book) => {
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

const handleBodyRow = (row, book) => {
    book.hightlights.push({
        type: row.type === 'Evidenziazione (Giallo)' ? HIGHLIGHT_TYPE_HIGHLIGHT : HIGHLIGHT_TYPE_NOTE,
        location: row.location.substr(row.location.indexOf(' ') + 1),
        marked: row.marked !== '',
        annotation: row.annotation,
    });
}

module.exports = router;
