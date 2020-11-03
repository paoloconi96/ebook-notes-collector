const googleBooksSearch = require('google-books-search');

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
