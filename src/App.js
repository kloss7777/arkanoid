import React, { useState, useRef, useEffect } from 'react';
import Paletka from './components/paletka/paletka';
import Pilka from './components/pilka/pilka';
import Cegly from './components/cegly/cegly';
import calculateCollisionArea from './util/calculateCollisionArea';
import Logo from './components/logo/logo';
import Bonuses from "./components/bonuses/bonuses";

import mp3BounceBall from "../src/assets/sounds/ball-racquet-bounce.mp3";
import mp3BounceBallPaddle from "../src/assets/sounds/ping-pong-paddle.mp3";
import mp3GotItem from "../src/assets/sounds/got-item.mp3";
import wavBallFail from "../src/assets/sounds/Ball_Bounce-Popup_Pixels-172648817.wav";
import wavBallBrick from "../src/assets/sounds/108737__branrainey__boing.wav";
import wavCoin1 from "../src/assets/sounds/166184__drminky__retro-coin-collect.wav";
import wavCoin2 from "../src/assets/sounds/126412__makofox__collect-normal-coin.wav";
import wavCoin3 from "../src/assets/sounds/126413__makofox__collect-special-coin.wav";

import {genColor, newState} from "./components/newState/newState";
import {createAudioPlayer} from "./components/createAudioPlayer";

const [playCoin1] = createAudioPlayer(wavCoin1);
const [playCoin2] = createAudioPlayer(wavCoin2);
const [playCoin3] = createAudioPlayer(wavCoin3);
const [playBounceBrick] = createAudioPlayer(wavBallBrick);
const [playBounceWall] = createAudioPlayer(mp3BounceBall);
const [playBouncePaddle] = createAudioPlayer(mp3BounceBallPaddle);
const [playGotItem] = createAudioPlayer(mp3GotItem);
const [playBallFail] = createAudioPlayer(wavBallFail);

const audioPlayers = {
    playCoin1,
    playCoin2,
    playCoin3,
    playBounceBrick,
    playGotItem,
    playBallFail,
    playBounceWall,
    playBouncePaddle
};

const App = () => {
    const [gameState, setGameState] = useState();

    const pressedKeys = useRef([]);
    const pressedTime = useRef({
        'ArrowRight': 0,
        'ArrowLeft': 0,
    });

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // definicja krawędzi bocznych
        const boundary = {
            top: 20,
            left: 0,
            right: width,
            bottom: height-100
        };

        // ustawiamy paletkę na środku
        const paletka_width = 200;
        const paletka = {
            base_width: paletka_width,
            width: paletka_width,
            height: 25,
            x: (width/2-paletka_width/2),
            y: height-120,
            delta: 5,
        };

        const ball_radius = 15;
        const pilka = {
            radius: ball_radius,
            x: width/2,
            y: paletka.y-ball_radius,
            dx: 0,
            dy: 0,
            base_speed: 10
        };

        const level = 3;
        const cegly = generujCegly(10,20,width,height,level).slice();
        const collisionArea = calculateCollisionArea(cegly,pilka);

        // bonusy wypadają z klocków rozbitych
        const bonuses = [];

        const gamePoints = 0;

        setGameState({
            width: width,
            height: height,
            paletka: paletka,
            boundary: boundary,
            pilka: pilka,
            cegly: cegly,
            collisionArea: collisionArea,
            bonuses: bonuses,
            gamePoints: gamePoints,
            count: 5,
            lives: 3,
        });

        const onKeyUp = (event) => {
            pressedKeys.current = pressedKeys.current.filter(code => code !== event.code);
            if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' ) {
                pressedTime.current[event.code] = 0;
            }
        };

        const onKeyPress = (event) => {
            switch (event.code) {
                case 'ArrowRight':
                case 'ArrowLeft':
                case 'Space':
                {
                    if(pressedKeys.current.indexOf(event.code) === -1) {
                        pressedKeys.current.push(event.code);
                    }
                    break;
                }
                default: break;
            }
        };

        const onClockTick = () => {
            setGameState(state => newState(state, pressedKeys, pressedTime, audioPlayers ));
        };

        window.addEventListener("keydown", onKeyPress);
        window.addEventListener("keyup", onKeyUp);
        const onClockInterval = setInterval(onClockTick, 16);

        return () => {
            window.removeEventListener("keydown", onKeyPress);
            window.removeEventListener("keyup", onKeyUp);
            clearInterval(onClockInterval);
        }

    }, []);


    const genCeglaKey = (row,col) => ""+row+"-"+col;

    //
    const levelBrickGen = (level,row,col) => {
        if (level === 1) {
            if (Math.random() >= 0.5) return 0;
            return Math.ceil(Math.random()*3)
        }
        if (level === 2) {
            return 3;
        }
        if (level === 3) {
            if ((row % 2) !== (col % 2)) {
                return 3;
            }
        }
    };


//    const degToRad = angle => angle * Math.PI / 180.0;

//    const MAX_BOUNCE_ANGLE = 60;


    const generujCegly = (rows,cols,screen_width,screen_height,level) => {
        let cegly = [];
        const cegla_width = (screen_width*0.8)/cols;
        const cegla_height = cegla_width*0.34;
        const start_x = (screen_width-screen_width*0.8)/2;
        const start_y = 200;
        for (let row=0; row<rows; row++) {
            for(let col=0; col<cols; col++) {
                const hitpoints = levelBrickGen(level,row,col);
                if (!hitpoints) continue;
                const cegla = {
                    key: genCeglaKey(col,row),
                    x: start_x+col*cegla_width,
                    y: start_y+row*cegla_height,
                    width: cegla_width,
                    height: cegla_height,
                    // FIXME! ilość punktów ze stanu; i kolor początkowy też z tego stanu
                    hit_points: hitpoints,
                    color: genColor(hitpoints)
                };
                cegly = cegly.concat(cegla);
            }
        }
        return cegly;
    };

    if (!gameState) return null;
    return (
        <svg width={gameState.width} height={gameState.height}>
            <rect width={gameState.width} height={gameState.height} style={{fill: '#cccccc'}} />
            <Logo />
            <text x="20" y="20" fontFamily="sans-serif" fontSize="20px" fill="black">Points: {gameState.gamePoints}</text>
            <text x="20" y="40" fontFamily="sans-serif" fontSize="20px" fill="black">Lives: {gameState.lives}</text>
            <Paletka {...gameState.paletka} />
            <Pilka {...gameState.pilka} />
            <Cegly cegly={gameState.cegly.slice()}/>
            <Bonuses bonuses={gameState.bonuses.slice()}/>
        </svg>
    );
}

export default App;

