const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const fs = require('fs');
const TransloaditClient = require('transloadit');
const admin = require('firebase-admin');
const serviceAccount = require('./fir-firestore-trans-sam-firebase-adminsdk-9cq7w-c7505b0073.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const settings = {timestampsInSnapshots: true};
const db = admin.firestore();
db.settings(settings);
const transloadit = new TransloaditClient({
  authKey: '7fcf63e0d5f211e8b8fd8d320311d96d',
  authSecret: '9c259b3cce4d5955dd898b537327e9ca03f0f232',
});


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/api/videos', function(req, res) {
  let videos = []
  db.collection('youtube_clone').get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      videos.push({id: doc.id, data: doc.data()})
    });
    res.json(videos);
  })
  .catch((err) => {
    console.log(err);
    res.json({});
  });
});


app.get('/api/video/:id', function(req, res) {
  db.collection('youtube_clone').doc(req.params.id).get()
  .then((snapshot) => {
    res.json({id: snapshot.id, data: snapshot.data()});
  })
  .catch((err) => {
    console.log(err);
    res.json({});
  });
});

app.post('/api/save-video/:assemblyId', function(req, res) {
  // https://api2.transloadit.com/assemblies
  transloadit.getAssembly(req.params.assemblyId, function (err, status) {
    if(err){
        console.log(err);
        return res.json({message: 'Could not fetch assembly'});
      }
    const data = {
        title: req.body.title || req.body.name,
        license: req.body.license || 'IIC',
        caption: req.body.caption || 'No caption provided, enjoy the video',
        poster: status.results.thumbnailed[0].ssl_url,
        sources: [
          {
            type: status.results.webm_720p_encoded[0].mime,
            size: 720,
            src: status.results.webm_720p_encoded[0].ssl_url
          },
          {
            type: status.results.browser1080_encoded[0].mime,
            size: 1080,
            src: status.results.browser1080_encoded[0].ssl_url
          },
          {
            type: status.results.browser1440_encoded[0].mime,
            size: 1440,
            src: status.results.browser1440_encoded[0].ssl_url
          }
        ]
      }

      const id = req.params.assemblyId + new Date().getTime();
      const docRef = db.collection('youtube_clone').doc();
      docRef.set(data);
      res.json({message: 'Succesfully updated videos list', data, id});
  })
  
});

const api1 = functions.https.onRequest(app)

module.exports = {
  api1
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
