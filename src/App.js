import React, { useState, useRef, useEffect } from 'react';
import Paletka from './components/paletka/paletka';
import Pilka from './components/pilka/pilka';
import Cegly from './components/cegly/cegly';
import collisionDetect from './util/collisionDetect';
import calculateCollisionArea from './util/calculateCollisionArea';
import Logo from './components/logo/logo';
import Bonuses from "./components/bonuses/bonuses";

import mp3BounceBall from "../src/assets/sounds/ball-racquet-bounce.mp3";
import mp3BuonceBallPaddle from "../src/assets/sounds/ping-pong-paddle.mp3";
import mp3GotItem from "../src/assets/sounds/got-item.mp3";

const playerBounceWall = new Audio(mp3BounceBall);
const playerBouncePaddle = new Audio(mp3BuonceBallPaddle);
const playerGotItem = new Audio(mp3GotItem);

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
            setGameState(state => newState(state));
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

    const genColor = idx => {
        const cnt = (gameState && gameState.count) ? gameState.count : 5;
        const red = idx*(255/cnt);
        const green = 0;
        const blue = 255-idx*(255/cnt);
        return "rgb("+[red,green,blue].join(',')+')';
    };

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

    const pressTimeToSpeed = pressTime => pressTime;
//    const degToRad = angle => angle * Math.PI / 180.0;

//    const MAX_BOUNCE_ANGLE = 60;

    const newState = state => {
        let paletka = { ...state.paletka };
        let pilka =  {...state.pilka};
        let cegly = state.cegly.slice();
        let bonuses = state.bonuses.slice();
        let cegly_zmienione = false;

        let gamePoints = state.gamePoints;

        // obsługa przesunięcia paletki gdy wciśnięty jest klawisz na klawiaturze
        if (pressedKeys.current.indexOf('ArrowRight')>=0) {
            pressedTime.current['ArrowRight']++;
            paletka.x = paletka.x+paletka.delta+pressTimeToSpeed(pressedTime.current['ArrowRight']);
            if ( (paletka.x+paletka.width) > state.boundary.right ) {
                paletka.x = state.boundary.right-paletka.width;
            }
        }
        if (pressedKeys.current.indexOf('ArrowLeft')>=0) {
            pressedTime.current['ArrowLeft']++;
            paletka.x = paletka.x-paletka.delta-pressTimeToSpeed(pressedTime.current['ArrowLeft']);
            if (paletka.x<state.boundary.left) {
                paletka.x = state.boundary.left;
            }
        }
        if (pressedKeys.current.indexOf('Space')>=0) {
            if (pilka.dx === 0 && pilka.dy === 0) {

                //let angle = ((Math.random()*90)-45)*2;
                //let angle = 90-(Math.random()*90);
                //
                // console.log('angle: ',angle,this.degToRad(angle));
                // pilka.dx = Math.sin(angle)*pilka.base_speed;
                // pilka.dy = Math.cos(angle)*pilka.base_speed;

                pilka.dy = -5;
                pilka.dx = +5;
                if (Math.random()>0.5) {
                    pilka.dx = -5;
                }
            }
        }

        // animacja bonusów
        const newBonuses = [];
        if (bonuses.length) {
            for (let bonus in bonuses) {
                // bonus.key - key kolejnego bonusa
                // bonus.x - pozcja w poziomie (niezmienna)
                // bonus.y - pozycja w ponionie (rośnie)
                // bonus.width - szerokosc
                // bonus.height - wysokosc
                // bonus.dy = szybkość opadania
                // bonus.type - co to w ogóle jest
                const newBonus = {...bonuses[bonus], y: +bonuses[bonus].y + bonuses[bonus].dy};
                let putToTable = true;

                if (newBonus.y>paletka.y) {
                    if ((newBonus.x>=paletka.x) && (newBonus.x+newBonus.width < paletka.x+paletka.width)) {
                        console.log('bonus type: ',newBonus.type);
                        playerGotItem.play();

                        if (newBonus.type === 1) {
                            paletka.width += 20;
                        }

                        if (newBonus.type === 2) {
                            paletka.width -= 20;
                        }

                        if (newBonus.type === 3) {
                            paletka.width = paletka.base_width;
                        }

                        gamePoints += 15;
                        putToTable = false;
                    }
                }

                if (newBonus.y > state.boundary.bottom) {
                    putToTable = false;
                }

                if (putToTable) {
                    newBonuses.push({...newBonus});
                }

            }
        }

        // animacja pilki
        if (pilka.dx !== 0 && pilka.dy !== 0) {
            pilka.x = pilka.x+pilka.dx;
            pilka.y = pilka.y+pilka.dy;
            // opory powietrza:
            pilka.dx = pilka.dx*0.9999;

            // kolizje ze ścianami
            if (pilka.x+pilka.radius>state.boundary.right || pilka.x-pilka.radius<state.boundary.left) {
                pilka.dx = -pilka.dx;
                playerBounceWall.play();
            }
            if (pilka.y<state.boundary.top) {
                pilka.dy = -pilka.dy;
                playerBounceWall.play();
            }


            if (pilka.y>state.boundary.bottom) {
                // pilka wraca na paletkę:
                pilka.dx = 0;
                pilka.dy = 0;
            }


            // odbicie piłki od paletki
            if (pilka.y+pilka.radius>paletka.y && pilka.x>paletka.x && pilka.x<paletka.x+paletka.width) {
                const speedXY = Math.sqrt(pilka.dx*pilka.dx + pilka.dy*pilka.dy);
                const paddleCenterX = paletka.x + paletka.width/2;
                const posX = -(pilka.x - paddleCenterX)/(paletka.width/2);

//                console.log(posX);
                const influenceX = 0.70;
                const speedX = speedXY * posX * influenceX;
                const speedUPonHit = 1.03; // +3%
                pilka.dx = speedX*speedUPonHit;

                const speedY = Math.sqrt(speedXY*speedXY - speedX*speedX) * (pilka.dy > 0? -1 : 1);
                pilka.dy = speedY*speedUPonHit;


//        pilka.dx = Math.sign(pilka.dx)*(pilka.base_speed+Math.abs(miejsce));
//         pilka.dy = -pilka.base_speed;
                pilka.y = paletka.y-pilka.radius;
                playerBouncePaddle.play();
            }

            if (state.collisionArea) {
                let { minX, maxX, minY, maxY } = {...state.collisionArea};
                if (pilka.x>minX && pilka.x<maxX && pilka.y>minY && pilka.y<maxY) {
                    // kolizje z cegłami
                    let cegla_uderzona;
                    let dir;
                    for (let i in cegly) {
                        var cegla = cegly[i];
                        dir = collisionDetect(pilka,cegla);
                        if (dir === "") continue;
                        cegly_zmienione = true;
                        cegla_uderzona = cegla;
                        break;
                    }

                    if (cegla_uderzona) {
                        playerBounceWall.play();
                        if (dir === "bottom") {
                            pilka.dy = -pilka.dy;
                        }
                        if (dir === "left") {
                            pilka.dx = -pilka.dx;
                        }
                        if (dir === "right") {
                            pilka.dx = -pilka.dx;
                        }
                        if (dir === "top") {
                            pilka.dy = -pilka.dy;
                        }
                        cegla_uderzona.hit_points = cegla_uderzona.hit_points-1;
                        cegla_uderzona.color = genColor(cegla_uderzona.hit_points);
                        if (cegla_uderzona.hit_points === 0) {
                            cegly = cegly.filter(cegla => cegla.key !== cegla_uderzona.key);
                            newBonuses.push({
                                key: cegla.x + 'x' + cegla.y,
                                y: cegla.y,
                                x: cegla.x+(cegla.width/2),
                                width: 20,
                                height: 30,
                                dy: 2+Math.random()*3,
                                type: Math.ceil(Math.random()*5),
                            });
                        }
                    }
                }
            }
            // koniec dx<>0 ,dy <> 0
        } else {
            // czyli jak jest reset piłki, pozycja startowa na paletce
            paletka.width = paletka.base_width;

            pilka.y = paletka.y-pilka.radius;
            pilka.x = paletka.x+(paletka.width/2);

        }

        const changes = {
            paletka: paletka,
            pilka: pilka,
            bonuses: newBonuses,
            gamePoints: gamePoints
        };
        if (cegly_zmienione) changes.cegly = cegly;

        return {
            ...state,
            ...changes
        }

    };

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
            <Paletka {...gameState.paletka} />
            <Pilka {...gameState.pilka} />
            <Cegly cegly={gameState.cegly.slice()}/>
            <Bonuses bonuses={gameState.bonuses.slice()}/>
        </svg>
    );
}

export default App;

