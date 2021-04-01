const express = require('express');
const openWeatherService = require('./openWeatherMap-service');
let data = null;

const error_message = `<p class="text-danger">Pas de données</p>`;


exports.router = (function() {
    var serviceRouter = express.Router();   

    serviceRouter.route('/moyenne7j/').get(async function(req, res) {       
        result = await moyenne7j();     
        if(result) {
        let message = `<p>Moyenne des températures sur les 7 prochains jours :</p> <p>${result}°</>`;
        res.render('index', {resultat : message});
        } else {
            res.render('index', {resultat : error_message});
        }
    })

    serviceRouter.route('/maxtemp3j/').get(async function(req, res) {      
        result = await maxtemp3j();        
        if(result) {    
        let message =  
        `<ul class="list-unstyled">
        <li>${getDateLocale(result[0].jour)} : ${result[0].temperature}°</li>
        <li>${getDateLocale(result[1].jour)} : ${result[1].temperature}°</li>
        <li>${getDateLocale(result[2].jour)} : ${result[2].temperature}°</li>
        </ul>`
        res.render('index', {resultat : message});
    } else {
        res.render('index', {resultat : error_message});
    }
        
      })

      serviceRouter.route('/moyenneEnsoleillement/').get(async function(req, res) {       
        result = await moyenneEnsoleillement();  
        if(result) {
        let message = 
        `<p>Moyenne d'ensoleillement pour les 7 prochains jours (UVI)</p> 
        <p>${result}</p>`     
        res.render('index', {resultat : message});
    } else {
        res.render('index', {resultat : error_message});
    }
      })

      serviceRouter.route('/journeeHumide/').get(async function(req, res) {       
        result = await journeeHumide();  
        if(result) {   
        let message = 
        `<p>Journée la plus humide : ${getDateLocale(result[0].jour)}</p>
        <p>Taux d'humidité : ${result[0].humidite} %</p>`  
        res.render('index', {resultat : message});
    } else {
        res.render('index', {resultat : error_message});
    }
      })

      serviceRouter.route('/jourVenteux/').get(async function(req, res) {       
        result = await jourVenteux();  
        if(result) {
        let message = 
        `<p>Journée la plus venteuse : ${getDateLocale(result[0].jour)}</p>
         <p>Vitesse du vent : ${result[0].vent} km/h</p>`  
        res.render('index', {resultat : message});
    } else {
        res.render('index', {resultat : error_message});
    }
      }) 

    return serviceRouter;
})();

async function  createDonnees() {
    return new Promise(async function (resolve) {
    if(!data) {       
        await openWeatherService.daily().then((res) => {
            data = res;
        }).catch((error) => {reject(error)});
     }        
    let donnees = []; 
    for (let i = 1; i < data.length; i++) {
        let d = data[i];
        let donnee =  { jour : new Date(d.dt*1000),  temperature : d.temp.day,  ensoleillement : d.uvi, humidite : d.humidity, vent : d.wind_speed}; 
        donnees.push(donnee);
        
    }
   resolve(donnees);
})
}

function moyenne7j() {    
   return new Promise(async function(resolve, reject) {
   await createDonnees().then((donnees) => {
    resolve (Math.round((donnees.map(p => p.temperature).reduce( ( p, c ) => p + c, 0 )) / donnees.length));
    }).catch((error) => reject(error));  
    });
}

function maxtemp3j() {
    return new Promise(async function(resolve, reject) {
    await createDonnees().then((donnees) => {
    let d = donnees.map(a => { 
        return { jour : a.jour,  temperature : a.temperature};        
    });
    resolve(d.sort((a, b) => b.temperature - a.temperature).slice(0,3));
}).catch((error) => reject(error));
})
}

function moyenneEnsoleillement() { 
    return new Promise(async function(resolve, reject) {
    await createDonnees().then((donnees) => {   
    resolve  (((donnees.map(p => p.ensoleillement).reduce( ( p, c ) => p + c, 0 )) / donnees.length).toFixed(2));
    }).catch((error) => reject(error));
});
}

function journeeHumide() {
    return new Promise(async function(resolve, reject) {
    await createDonnees().then((donnees) => {
    let d = donnees.map(a => { 
        return { jour : a.jour,  humidite : a.humidite};        
    });
    resolve(  d.sort((a, b) => b.humidite - a.humidite).slice(0,1));
}).catch((error) => reject(error));
}); 
}

function jourVenteux() {
    return new Promise(async function(resolve, reject) {
   await createDonnees().then((donnees) => {
    let d = donnees.map(a => { 
        return { jour : a.jour,  vent : a.vent};        
    });
    resolve( d.sort((a, b) => b.vent - a.vent).slice(0,1));
    }).catch((error)=> reject(error));
   });
   
}

//date formatting
function getDateLocale(date) {
    return new Date(date).toLocaleString('fr-FR',{
        weekday : 'long',
        day : 'numeric',
        month : 'long',
        year : 'numeric'
    })
}