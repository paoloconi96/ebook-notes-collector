const admin = require('firebase-admin');
const serviceAccount = require('../data/google-service-account.json');

const database = {};

let db;

database.initialize = async () => {
    if (db) {
        console.warn('Database is already connected.');
        return db;
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();

    console.log('Database is ready.');
}

database.get = () => {
    // @TODO: Throw exception if db isn't ready

    return db;
}

module.exports = database;
