const express = require('express');
const app  = express();

const router = require('./weather-service').router;

app.use('/meteo', router);
app.set('view engine', 'ejs');

 app.get('/', (req,res) => {
    res.render("index", {resultat : ''}); 
}) 

app.listen(8080, () => {
    console.log('Ready...')
  })

