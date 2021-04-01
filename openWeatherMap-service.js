let axios = require('axios');


const base_url = 'https://api.openweathermap.org/data/2.5';
const api_key = '7a28ab8e6836c9155d60347f96c47fe1';

//query params for Paris
const city = 'Paris';
const units = 'metric';
const lang = 'fr';
const lat = '48.8534';
const lon = '2.3488';

module.exports = {   
    daily : async function(req, res) {
        return new Promise((resolve, reject) => {
            axios.get(base_url + '/onecall', {             
              params: {
                lat: lat,
                lon: lon,
                exclude : 'current,minutely,hourly,alerts',
                appid: api_key,
                units: units,
                lang : lang,
              }
            }).then((response) => {
              if(response.data.daily) {
                resolve(response.data.daily);
              } else {
                reject('pas de résultat');
              }
            }).catch((error) => {
                reject(error);
            });
          });
       
    }
}
