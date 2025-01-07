import React, { useState, useEffect } from 'react';
import './Position.css';
import Map from '../Map/Map';
import Forecast from '../Forecast/Forecast';
import axios from 'axios';

const API_KEY = '0228cb5db66849af97395611250601';
const API_URL = `http://api.weatherapi.com/v1/current.json`;
const EXPRESS_SERVER_URL = 'http://localhost:8080/api/weather';
let city = null;
let cityName = null;

const Position = () => {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);

                    if (city) {
                        fetchWeatherByCity(cityName);
                    } else {
                        fetchWeather(position.coords.latitude, position.coords.longitude);
                    }
                },
                (error) => {
                    setError(error.message);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {

            const response = await axios.post(`${API_URL}?key=${API_KEY}&q=${lat},${lon}&lang=fr`);
            setWeather(response.data);
            sendToExpressServer(lat, lon);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchWeatherByCity = async (city) => {
        try {
            const response = await axios.get(`${API_URL}?key=${API_KEY}&q=${city}&lang=fr`);
            setWeather(response.data);
            //sendToExpressServer(city);
        } catch (error) {
            setError(error.message);
        }
    };

    const sendToExpressServer = async (lat, lon) => {
        try {
          console.log(lat, lon);
          const response = await axios.post('http://localhost:8080/api/weather', {
            latitude: lat,
            longitude: lon
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log(response.data);
        } catch (error) {
          console.error(error);
        }
      };

    return (
        <div id='frame'>
            {latitude && longitude ? (
                <div>
                    <h3>Votre position actuelle :</h3>
                    <p>Latitude: {latitude}</p>
                    <p>Longitude: {longitude}</p>

                    <input id="city" type="text" placeholder="Ville ?" />
                    <button onClick={() => {
                        fetchWeatherByCity(document.getElementById("city").value);
                        cityName = document.getElementById("city").value;
                        }}>Rechercher</button>

                    {weather ? (
                        <div id='weather'>
                            <h3>La meteo pour {weather.location.name}</h3>
                            <h2>{weather.current.date}</h2>
                            <div id='icon'><img src={weather.current.condition.icon} alt={weather.current.condition.icon}></img></div>
                            <p>Condition: {weather.current.condition.text}</p>
                            <p>Temperature: {weather.current.temp_c}°C</p>
                            <p>Ressenti: {weather.current.feelslike_c}°C</p>
                            <p>Humidité: {weather.current.humidity}%</p>
                            <p>Vitesse du vent: {weather.current.wind_kph} km/h</p>
                            <p>Direction du vent: {weather.current.wind_dir}</p>
                            <p>Pressure: {weather.current.pressure_mb} mb</p>
                        </div>
                    ) : (
                        <p>Loading weather data...</p>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : null}
            <div>
                <h3> Prévision de la semaine pour {weather ? weather.location.name : ''} </h3>
                <Forecast cityName={cityName}></Forecast>
                {console.log(cityName, latitude, longitude)}
            </div>
            <div>
                <Map latitude={latitude} longitude={longitude} />
            </div>
        </div>
    );
};

export default Position;