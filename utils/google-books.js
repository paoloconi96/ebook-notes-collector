const https = require('https');
const { googleApiKey } = require('../data/config');

const googleBooks = {};

const pathPrefix = `/books/v1/volumes?key=${encodeURIComponent(googleApiKey)}`;

googleBooks.search = query => {
    const options = {
        hostname: 'www.googleapis.com',
        port: 443,
        path: `${pathPrefix}&q=${encodeURIComponent(query)}`,
        method: 'GET',
    }

    return new Promise(((resolve, reject) => {
        const request = https.request(options, response => {
            response.setEncoding('utf8');
            var body = '';

            response.on('data', chunk => {
                body = body + chunk;
            });

            response.on('end',() => {
                body = JSON.parse(body);

                if (response.statusCode === 200) {
                    resolve(body);
                    return;
                }

                reject('Api call failed with response code ' + response.statusCode);
            });

        });

        request.on('error', error=> {
            console.error('Error : ' + error.message);
            reject(error);
        });

        request.end()
    }));
}

googleBooks.searchFirstResult = async query => {
    const googleBooksSearchResults = await googleBooks.search(query);

    if (googleBooksSearchResults.items.length === 0) {
        return null;
    }

    return googleBooksSearchResults.items[0];
}

module.exports = googleBooks;
