/* obliczanie granic w jakich znajdują się cegły, dla uniknięcia niepotrzebnych obliczeń kolizji piłki z cegłami */

const calculateCollisionArea = (cegly,pilka) => {
    let minX,maxX,minY,maxY;

    if (cegly.length === 0) {
        console.log("[calculateCollisionArea] empty");
        return null;
    }
    minX = cegly[0].x;
    maxX = cegly[0].x+cegly[0].width;
    minY = cegly[0].y;
    maxY = cegly[0].y+cegly[0].height;

    cegly.forEach(cegla => {
        if (cegla.x<minX) minX = cegla.x;
        if (cegla.x+cegla.width>maxX) maxX = cegla.x+cegla.width;
        if (cegla.y<minY) minY = cegla.y;
        if (cegla.y+cegla.height>maxY) maxY = cegla.y+cegla.height;
    });
    return { minX: minX-pilka.radius, maxX: maxX+pilka.radius, minY: minY-pilka.radius, maxY: maxY+pilka.radius };
};

export default calculateCollisionArea;
