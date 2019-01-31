const collisionDetect = (pilka, cegla) => {
    // zwracamy miejsce kolizji na CEGLE

    // {radius: 20, x: 1415, y: 58, dx: 5, dy: 5} {x: 652.8, y: 278.336, width: 76.8, height: 26.112000000000002, color: "rgb(0,0,255)"}

    // cegły są nieruchome, zatem kolizja wynika z nadejścia piłki z danego kierunku

    // piłka leci do góry czyli ujemny DY
    if (pilka.dy<0) {
        const pilka_top = pilka.y - pilka.radius;
        const cegla_bottom = cegla.y + cegla.height;
        if (pilka_top<=cegla_bottom && pilka_top>=cegla.y && pilka.x>=cegla.x && pilka.x<=cegla.x+cegla.width) {
//            console.log("bottom: ",pilka,cegla);
            return "bottom";
        }
    }

    // pilka leci w dół czyli ma dodatni DY
    if (pilka.dy>0) {
        const pilka_bottom = pilka.y+pilka.radius;
        const cegla_top = cegla.y;
        if (pilka_bottom>=cegla_top && pilka_bottom<=cegla.y+cegla.height && pilka.x>=cegla.x && pilka.x<=cegla.x+cegla.width) {
//            console.log("top: ",pilka,cegla);
            return "top";
        }
    }

    // piłka leci w prawą stronę
    if (pilka.dx>0) {
        const pilka_right = pilka.x+pilka.radius;
        const cegla_left = cegla.x;
        if (pilka_right>=cegla_left && pilka_right<=cegla_left+cegla.width && pilka.y>=cegla.y && pilka.y<=cegla.y+cegla.height) return "left";
    }

    // piłka leci w lewą stronę
    if (pilka.dx<0) {
        const pilka_left = pilka.x-pilka.radius;
        const cegla_right = cegla.x+cegla.width;
        if (pilka_left<=cegla_right && pilka_left>=cegla.x && pilka.y>=cegla.y && pilka.y<=cegla.y+cegla.height) return "right";
    }

    return "";
};

export default collisionDetect;
