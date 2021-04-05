const bookRanker = {};

/**
 * @TODO Improve performance
 *
 * @param   {any[]} booksLists
 * @param   {bool}  weightedAverage
 *
 * @returns {any[]}
 */
bookRanker.rankBooks = (booksLists, weightedAverage = true) => {
    const weightedBooks = new Map();
    for (const [listIndex, booksList] of booksLists.entries()) {
        const divider = booksLists.length - listIndex;
        for (const [index, book] of booksList.entries()) {
            console.log(book);

            let bookExtraStructure;
            if (weightedBooks.has(book.isbn13)) {
                bookExtraStructure = weightedBooks.get(book.isbn13)
            }

            if (!bookExtraStructure) {
                bookExtraStructure = {
                    book,
                    weight: [],
                }
            }

            bookExtraStructure.weight.push([listIndex, (index + 1) / divider]);

            weightedBooks.set(book.isbn13, bookExtraStructure);
        }
    }

    const rankedBooks = {};
    for (const [isbn, bookExtraStructure] of weightedBooks) {
        rankValue = 0;

        const booksListsLength = booksLists.length;
        for (let i = 0; i < booksListsLength; i++) {
            let found = false;

            for (weight of bookExtraStructure.weight) {
                if (weight[0] === i) {
                    rankValue += weight[1];
                    found = true;
                    break;
                }

                if (weight[0] > i) {
                    break;
                }
            }

            if (!found) {
                rankValue += booksLists[i].length / (booksListsLength - i);
            }
        }

        let rank = rankValue / booksLists.length;

        while (rankedBooks[rank]) {
            rank++;
        }

        rankedBooks[rank] = bookExtraStructure.book;
    }

    return Object.values(rankedBooks);
}

module.exports = bookRanker;
