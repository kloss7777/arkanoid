import React from 'react';

const cegla = (props) => {
    return (
        <rect rx="4" ry="3" width={props.width} height={props.height} x={props.x} y={props.y} style={{ fill: props.color, strokeWidth: 1, stroke: '#ccc' }}/>
    );
};

export default cegla;
