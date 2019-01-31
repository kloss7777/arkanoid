import React, {Fragment as Aux} from 'react';

const pilka = (props) => {
    return (
        <Aux>
            <circle r={props.radius} cx={props.x} cy={props.y} style={{ fill: '#e41f25'}}/>
        </Aux>
    );
};


/*
 w style w circle: fill: 'url(#RadialGradient1)'

 a nad tym:
            <defs>
                <radialGradient id="RadialGradient1">
                    <stop offset="0%" stop-color="#00ff00"/>
                    <stop offset="100%" stop-color="#0000ff"/>
                </radialGradient>
            </defs>

 */

export default pilka;


/*
    <g id="layer101" fill="#1b60ab" stroke="none">
        <path d="M179 417 c-24 -13 -57 -43 -74 -66 -28 -39 -30 -50 -30 -126 0 -77 2 -86 31 -126 45 -62 101 -89 184 -89 56 0 73 4 112 29 66 42 100 104 96 173 l-3 53 -114 3 c-121 3 -141 -3 -141 -43 0 -34 19 -44 95 -47 l70 -3 -31 -32 c-65 -67 -162 -48 -198 39 -18 44 -18 46 1 90 29 64 76 85 151 67 63 -15 85 -6 90 34 8 64 -147 92 -239 44z"/>
    </g>

 */
