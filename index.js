require('dotenv').config();
const express = require('express');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
const cors = require('cors');

app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json());

mongoClient.connect(process.env.MONGO_CONNECTION_STRING, (err, client) => {
    const db = client.db('db');
    const collections = {
        users: db.collection('users')
    };
    // collections.users.createIndex(
    //     { createdAt: 1 },
    //     { expireAfterSeconds: 130, partialFilterExpression: { verified: false } }
    //   )
    if (err) console.log(err);
    else {
        console.log("Connected to MongoDB server");
        fs.readdir(path.join(__dirname, 'routes'), (err, files) => {
            if (err) console.log(err);
            else files.forEach(file => require(`${path.join(__dirname, 'routes')}/${file}`)(app, collections));
        });
    };
});

app.listen(3000, () => console.log("Server started on PORT: 3000"));