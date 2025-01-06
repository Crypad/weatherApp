import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Forecast.css';

const API_KEY = '0228cb5db66849af97395611250601';
const API_URL = `http://api.weatherapi.com/v1/forecast.json`;

const Forecast = (props) => {
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

                    fetchWeather(position.coords.latitude, position.coords.longitude);

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

            const response = await axios.get(`${API_URL}?key=${API_KEY}&q=${lat},${lon}&days=7&lang=fr`);
            setWeather(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div id='forecast'>
            {weather && weather.forecast.forecastday.map((day, index) => (
                <div>
                    <h4>{day.date}</h4>
                    <img key={index}src={day.day.condition.icon}></img>
                    <p>{day.day.condition.text}</p>
                    <p>{day.day.avgtemp_c} °C</p>
                </div>
            ))}
        </div>
    )

}

export default Forecast;
