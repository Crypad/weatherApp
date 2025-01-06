import React from 'react';

import './Map.css';

const Map = ({latitude, longitude}) => (
    <div>
        <iframe width="600" height="350" src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.1}%2C${latitude - 0.1}%2C${longitude + 0.1}%2C${latitude + 0.1}&amp;layer=mapnik`} />
    </div>
);

export default Map;
