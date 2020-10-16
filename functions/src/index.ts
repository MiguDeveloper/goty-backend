import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
// con esto ya tenemos configurado nuestra base de datos
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://firestore-grafica-3e4e0.firebaseio.com',
});

// Para trabajar con firestore necesitamos una referencia a la base de datos
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.json({ message: 'Miguel pruebas firestore' });
});

export const getGoty = functions.https.onRequest(async (request, response) => {
  // EJEMPLO
  //const nombre = request.query.nombre || 'Sin nombre';
  //response.status(200).json({ nombre });
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos = docsSnap.docs.map((doc) => doc.data());
  response.json(juegos);
});

//express
const express = require('express');
const cors = require('cors');

const app = express();
// establecemos el cors para aceptar solicitudes de otros dominios
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos = docsSnap.docs.map((doc) => doc.data());
  res.json({
    isSuccess: true,
    message: 'solicitud correcta',
    data: juegos,
  });
});

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();
  if (!gameSnap.exists) {
    res.status(404).json({
      isSuccess: false,
      message: `No existe el juego con el ID: ${id}`,
    });
  } else {
    const antes = gameSnap.data() || { votos: 0 };
    await gameRef.update({
      votos: antes.votos + 1,
    });
    res.json({
      isSuccess: true,
      message: `Gracias por su voto a: ${antes.name}`,
    });
  }
});

// le debemos de indicar a firebase que tiene un servidor de express corriendo
export const api = functions.https.onRequest(app);
