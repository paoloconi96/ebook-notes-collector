const googleBooksSearch = require('google-books-search');
const bookRanker = require('./book-ranker');

const bookGuesser = {};

/**
 * Guess a book based on a basic "book" model using Google Books APIs
 *
 * @param {object} book
 * @param {string} language
 *
 * @returns {Promise<object>}
 */
bookGuesser.guessBook = async (book, language) => {
    return new Promise((resolve, reject) => {
        let booksByTitleCache;
        let booksByAuthorCache;
        let guessedBook;

        googleBooksSearch.search(book.title.substr(0, 25), {
            field: 'title',
            type: 'books',
            lang: language,
        }, async (error, booksByTitle) => {
            if (error) {
                console.error(error);
            }

            booksByTitleCache = booksByTitle ? booksByTitle : [];
            guessedBook = mergeAndGuess(booksByTitleCache, booksByAuthorCache);

            if (guessedBook) {
                resolve(guessedBook);
            }
        });

        googleBooksSearch.search(book.author, {
            field: 'author',
            type: 'books',
            lang: language,
        }, async (error, booksByAuthor) => {
            if (error) {
                console.error(error);
            }

            booksByAuthorCache = booksByAuthor ? booksByAuthor : [];
            guessedBook = mergeAndGuess(booksByTitleCache, booksByAuthorCache);

            if (guessedBook) {
                resolve(guessedBook);
            }
        });
    });
}

/**
 * Gets a book by it ISBN
 * @TODO Ensure the result is always correct
 * @TODO Fix me
 *
 * @param isbn
 * @returns {Promise<void>}
 */
bookGuesser.getByIsbn = async (isbn) => {
    await new Promise((resolve, reject) => {
        googleBooksSearch.search(isbn, {
            type: 'books',
        }, async (error, books) => {
            if (error || books.length === 0) {
                reject(error);
                console.error(error);
            }

            resolve(books[0]);
        });
    });
}

bookGuesser.guessBookList = async (book, language) => {
    const booksLists = await Promise.all([getBooksByAuthor(book, language), getBooksByTitle(book, language)]);

    const finalBooksLists = [];
    for (const booksList of booksLists) {
        const list = [];

        for (const book of booksList) {
            if (!book.industryIdentifiers) {
                continue;
            }

            for (const isbn of book.industryIdentifiers) {
                if (isbn.type === 'ISBN_13') {
                    book.isbn13 = isbn.identifier;

                    list.push(book);
                }
            }
        }

        finalBooksLists.push(list);
    }

    return bookRanker.rankBooks(finalBooksLists);
}

const getBooksByTitle = async (book, language) => {
    return new Promise((resolve, reject) => {
        googleBooksSearch.search(book.title, {
            field: 'title',
            type: 'books',
            lang: language,
        }, async (error, booksByTitle) => {
            if (error) {
                reject(error);
                console.error(error);
            }

            resolve(booksByTitle);
        });
    });
}

const getBooksByAuthor = async (book, language) => {
    return new Promise((resolve, reject) => {
        googleBooksSearch.search(book.author, {
            field: 'author',
            type: 'books',
            lang: language,
        }, async (error, booksByAuthor) => {
            if (error) {
                reject(error);
                console.error(error);
            }

            resolve(booksByAuthor);
        });
    });
}

/**
 * Merge data from the two arrays to improve guessing capabilities then return the choosen book
 *
 * @param {?array} booksByTitle
 * @param {?array} booksByAuthor
 *
 * @returns {?object}
 */
const mergeAndGuess = (booksByTitle, booksByAuthor) => {
    if (booksByTitle === undefined || booksByAuthor === undefined) {
        return;
    }

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

    return googleBook;
}

module.exports = bookGuesser;
