const database = require('./database');
const bookGuesser = require('./book-guesser');

const addBookHandler = {};

addBookHandler.addBook = async (draftBookId, bookIsbn) => {
    const book = await bookGuesser.getByIsbn(bookIsbn);
    const draftBook = getDraftVolume(draftBookId);
    await addBookHandler.createVolumeInDatabase(mergeData(draftBook, book));
    // @TODO remove draft volume
}

addBookHandler.createVolumeInDatabase = async (book) => {
    const db = database.get();
    const bookDocument = db.collection('books').doc(book.id);
    await bookDocument.set(book);
}

const mergeData = (draftBook, book) => {
    return {
        id: draftBook.id,
        authors: book.authors,
        categories: volumeInfo.categories ? volumeInfo.categories : null,
        imageLinks: volumeInfo.thumbnail ? volumeInfo.thumbnail : null,
        highlights: draftBook.highlights,
        publishedDate: book.publishedDate,
        title: book.title,

    }
}

const getDraftVolume = async (id) => {
    // Get data from the database and validate it
    const db = database.get();

    const draftBookDocuments = db.collection('draft-books').doc(id);
    const snapshot = await draftBookDocuments.get();

    if (!snapshot.exists) {
        // @TODO
    }

    return snapshot;
}

module.exports = addBookHandler;
