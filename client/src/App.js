import React from 'react';
import './App.css';
import Position from './modules/Position/Position';
import Navigation from './modules/Navigation/Navigation';


function App() {

  return (
    <div>
      <Navigation> </Navigation>
      <h1>Weather App</h1>
      <Position> </Position>
    </div>
  );
}

export default App;
