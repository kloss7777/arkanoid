import React from 'react';

const paletka = (props) => {
    return (
        <rect rx={props.height/2} ry={props.height/2} width={props.width} height={props.height} x={props.x} y={props.y} style={{ fill: '#2965ad'}}/>
    );
};

export default paletka;
