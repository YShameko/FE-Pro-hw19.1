"use strict";

const API_KEY = '11ef37b129d506c8908c384c6f64204b';
const API_URL = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&lang=uk&units=metric`;
const WEATHER_WIDGET_CLASS = '.weather-widget';
const WEATHER_TEXT_INFO_CLASS = '.weather-text-info';

// -----------------------------------------------------------------------------------------------------------------
//
// url - URL to api.openweathermap.org with necessary paramaters, like city name, language, measurement units, etc.
// Full info about params for 'url': https://openweathermap.org/current
// 
// mode	(optional) - Response format. Possible values are 'xml' and 'html'. 
//                   If you don't use the mode parameter format is JSON by default.
async function getWeatherData(url, mode = '') {
    let response;

    try {
        if (mode) {
            response = await fetch(url + `&mode=${mode}`);
        } else {
            response = await fetch(url);
        }

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null; 
        }

        if (mode === 'xml' || mode === 'html') {
            const weatherData = await response.text();
            return weatherData;
        } else { // JSON
            const weatherData = await response.json();
            return weatherData;
        }
    } catch (error) {
        console.error('Не вдалося отримати дані про погоду:', error);
        return null;
    }
}

function updateWeather(cityName) {
    const weatherWidget = document.querySelector(WEATHER_WIDGET_CLASS);
    const weatherInfo = document.querySelector(WEATHER_TEXT_INFO_CLASS);
    const jsonWeatherPromise = getWeatherData(API_URL + `&q=${cityName}`);
    const htmlWeatherPromise = getWeatherData(API_URL + `&q=${cityName}`, 'html');

    jsonWeatherPromise.then(data => {
        if (data) {
        const { name, timezone, sys, main, wind, weather } = data;
        const { country, sunrise, sunset } = sys;
        const { temp, feels_like } = main;
        const { speed, gust } = wind;
        const { description } = weather[0];

        weatherInfo.innerHTML = `<p>Детальніше про погоду: <b>${name}, ${country}</b></p>`;
        weatherInfo.innerHTML += `<p>Поточна температура: ${temp}°C </p>`;
        weatherInfo.innerHTML += `<p>Відчувається як: ${feels_like}°C </p>`;
        weatherInfo.innerHTML += `<p>Хмарність: ${description}</p>`;
        weatherInfo.innerHTML += `<p>Швидкість вітру: ${speed} м/с, пориви до: ${gust} м/с</p>`;

        const sunriseDate = new Date((sunrise + timezone) * 1000);
        const sunsetDate = new Date((sunset + timezone) * 1000);
        weatherInfo.innerHTML += `<p>Схід сонця: ${sunriseDate.toUTCString().slice(-12, -7)} `
                             + `захід: ${sunsetDate.toUTCString().slice(-12, -7)}</p>`;
        
        const currentDate = new Date().toLocaleString();
        weatherInfo.innerHTML += `<p style="font-size: x-small;">Данні було оновлено: <b>`
                             + `${currentDate.slice(-8)}</b></p>`;
    }
    });

    htmlWeatherPromise.then(data => {
        if (data) {
            weatherWidget.innerHTML = data;
        }
    });
}

// ============================================================================================================
const citiesList = document.getElementById('cities-list');
const weatherBtn = document.querySelector('.weather-refresh-btn');

citiesList.addEventListener('change', () => {
    const selectedCity = citiesList.value;
    updateWeather(selectedCity);
});

weatherBtn.addEventListener('click', () => {
    const selectedCity = citiesList.value;
    updateWeather(selectedCity);
});

updateWeather(citiesList.value);