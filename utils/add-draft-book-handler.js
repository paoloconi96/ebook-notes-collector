const fs = require('fs');
const csv = require('csv-parser');
const {v4: uuidv4} = require('uuid');
const database = require('./database');

const addDraftBookHandler = {};

const HIGHLIGHT_TYPE_HIGHLIGHT = 'highlight';
const HIGHLIGHT_TYPE_NOTE = 'note';

let book;

addDraftBookHandler.addDraftBook = async (file) => {
    return new Promise((resolve, reject) => {
        book = {
            title: '',
            author: '',
            highlights: [],
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
                    index++;

                    return;
                }

                handleBodyRow(data, book);
            })
            .on('end', async () => {
                book.highlights = sortHighlights(book.highlights);
                book.id = uuidv4();
                await addDraftBookHandler.createVolumeInDatabase(book);
                resolve(book);
            })
        ;
    });
}

addDraftBookHandler.createVolumeInDatabase = async (book) => {
    const db = database.get();

    const bookDocument = db.collection('draft-books').doc(book.id);
    await bookDocument.set({
        title: book.title,
        author: book.author,
        highlights: book.highlights,
    });
}

const sortHighlights = (highlights) => {
    // @TODO: Maybe data is already sorted?
    return book.highlights.sort((a, b) => {
        if (a < b) {
            return -1;
        }

        if (a > b) {
            return 1;
        }

        return 0;
    });
}

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
    // @TODO: handle multilanguage
    book.highlights.push({
        type: row.type === 'Evidenziazione (Giallo)' ? HIGHLIGHT_TYPE_HIGHLIGHT : HIGHLIGHT_TYPE_NOTE,
        location: row.location.substr(row.location.indexOf(' ') + 1),
        marked: row.marked !== '',
        annotation: row.annotation,
    });
}

module.exports = addDraftBookHandler;
