import React from 'react';

const colors = ['#117D0B', '#880B19', '#00007f', '#ff0', '#f0f'];

const bonus = (props) => {
    return (
        <rect rx="4" ry="3" width={20} height={20} x={props.x} y={props.y} style={{ fill: colors[props.type-1], strokeWidth: 1, stroke: colors[props.type-1] }}/>
    );
};

export default bonus;
