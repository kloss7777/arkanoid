import collisionDetect from "../../util/collisionDetect";
const pressTimeToSpeed = pressTime => (pressTime*pressTime)/pressTime;

export const genColor = idx => {
    const cnt = 5; // gameState.count
    const red = idx*(255/cnt);
    const green = 0;
    const blue = 255-idx*(255/cnt);
    return "rgb("+[red,green,blue].join(',')+')';
};

export const newState = (state, pressedKeys, pressedTime, audioPlayers) => {
    let paletka = { ...state.paletka };
    let pilka =  {...state.pilka};
    let cegly = state.cegly.slice();
    let bonuses = state.bonuses.slice();
    let cegly_zmienione = false;
    let livesCount = state.lives;

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

    if (pilka.dx === 0 && pilka.dy === 0 && livesCount>0 && pressedKeys.current.indexOf('Space')>=0) {
        //let angle = ((Math.random()*90)-45)*2;
        //let angle = 90-(Math.random()*90);
        //
        // console.log('angle: ',angle,this.degToRad(angle));
        // pilka.dx = Math.sin(angle)*pilka.base_speed;
        // pilka.dy = Math.cos(angle)*pilka.base_speed;

        pilka.dy = -5;
        if (Math.random()>=0.5) {
            pilka.dx = -5;
        }
        else {
            pilka.dx = +5;
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

                    if (newBonus.type === 1) {
                        paletka.width += 20;
                        paletka.x -= 10;
                        if (paletka.x<0) {paletka.x = 0}
                        audioPlayers.playCoin1();
                    }

                    if (newBonus.type === 2) {
                        paletka.width -= 20;
                        audioPlayers.playCoin3();
                    }

                    if (newBonus.type === 3) {
                        paletka.width = paletka.base_width;
                        audioPlayers.playCoin2();
                    }

                    if (newBonus.type === 4) {
                        livesCount++;
                    }
                    if (newBonus.type>3) {
                        audioPlayers.playGotItem();
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
            audioPlayers.playBounceWall();
        }
        if (pilka.y<state.boundary.top) {
            pilka.dy = -pilka.dy;
            audioPlayers.playBounceWall();
        }

        if (pilka.y>state.boundary.bottom) {
            // pilka wraca na paletkę:
            pilka.dx = 0;
            pilka.dy = 0;
            audioPlayers.playBallFail();
            livesCount--;
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
            audioPlayers.playBouncePaddle();
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
                    audioPlayers.playBounceBrick();
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
        gamePoints: gamePoints,
        lives: livesCount
    };
    if (cegly_zmienione) changes.cegly = cegly;

    return {
        ...state,
        ...changes
    }

};
