import React, { useState, useEffect } from 'react';
import './Position.css';
import axios from 'axios';

const API_KEY = '0228cb5db66849af97395611250601';
const API_URL = `http://api.weatherapi.com/v1/current.json`;
let city = null;

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
                        fetchWeatherByCity(document.getElementById("city").value);
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
            
            const response = await axios.get(`${API_URL}?key=${API_KEY}&q=${lat},${lon}`);
            setWeather(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchWeatherByCity = async (city) => {
        try {
            const response = await axios.get(`${API_URL}?key=${API_KEY}&q=${city}`);
            setWeather(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            {latitude && longitude ? (
                <div>
                    <h3>Votre position actuelle :</h3>
                    <p>Latitude: {latitude}</p>
                    <p>Longitude: {longitude}</p>

                    <input id="city" type="text" placeholder="Ville ?" />
                    <button onClick={() => fetchWeatherByCity(document.getElementById("city").value)}>Rechercher</button>

                    {weather ? (
                        <div>
                            <h3>La meteo pour {weather.location.name}</h3>
                            <p>Condition: {weather.current.condition.text}</p>
                            <p>Temperature: {weather.current.temp_c}°C</p>
                            <p>Feels like: {weather.current.feelslike_c}°C</p>
                            <p>Humidity: {weather.current.humidity}%</p>
                            <p>Wind speed: {weather.current.wind_kph} km/h</p>
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
        </div>
    );
};

export default Position;