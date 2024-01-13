// --------------------------------------------------------------------------
// Math utility functions
// --------------------------------------------------------------------------

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function runiform(min, max) {
    return Math.random() * (max - min) + min;
}

function halton(index, base) {
    let fraction = 1;
    let result = 0;
    while (index > 0) {
        fraction /= base;
        result += fraction * (index % base);
        index = ~~(index / base); // floor division
    }
    return result;
}

function* getQuasirandom2DPoint(startidx) {
    for (let i = startidx + 100; ; i++) {
        yield [halton(i, 2), halton(i, 3)];
    }
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) { let temp = a; a = b; b = temp; }
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}

// --------------------------------------------------------------------------
// Game logic
// --------------------------------------------------------------------------

// Note that all weapons starting with a particular letter should
// be within the same weapon group.
subtracting_weapons = [
    { 'op': '-', value: '1', 'name': 'Arbalest' },
    { 'op': '-', value: '2', 'name': 'Axe' },
    { 'op': '-', value: '3', 'name': 'Canon' },
    { 'op': '-', value: '4', 'name': 'Club' },
    { 'op': '-', value: '5', 'name': 'Crossbow' },
    { 'op': '-', value: '6', 'name': 'Elephant Gun' },
    { 'op': '-', value: '7', 'name': 'Flail' },
    { 'op': '-', value: '8', 'name': 'Katana' },
    { 'op': '-', value: '9', 'name': 'Knife' },
    { 'op': '-', value: '10', 'name': 'Saber' },
    { 'op': '-', value: '11', 'name': 'Scythe' },
    { 'op': '-', value: '12', 'name': 'Shillelagh' },
    { 'op': '-', value: '13', 'name': 'Shortsword' },
    { 'op': '-', value: '14', 'name': 'Sling' },
    { 'op': '-', value: '15', 'name': 'Spear' }];

adding_weapons = [
    { 'op': '+', value: '1', 'name': 'Dagger' },
    { 'op': '+', value: '2', 'name': 'Halberd' },
    { 'op': '+', value: '3', 'name': 'Glaive' },
    { 'op': '+', value: '4', 'name': 'Lance' },
    { 'op': '+', value: '5', 'name': 'Longbow' },
    { 'op': '+', value: '6', 'name': 'Longsword' },
    { 'op': '+', value: '7', 'name': 'Mace' },
    { 'op': '+', value: '8', 'name': 'Man Catcher' },
    { 'op': '+', value: '9', 'name': 'Morning Star' },
    { 'op': '+', value: '10', 'name': 'Pike' },
    { 'op': '+', value: '11', 'name': 'Quarterstaff' },
    { 'op': '+', value: '12', 'name': 'Rapier' },
    { 'op': '+', value: '13', 'name': 'Voulge' },
    { 'op': '+', value: '14', 'name': 'Xiphos' },
    { 'op': '+', value: '15', 'name': 'War hammer' },
];

dividing_weapons = [
    { 'op': '/', value: '2', 'name': 'Bisector' },
    { 'op': '/', value: '3', 'name': 'Trisector' }
];

class Game {
    constructor() {
        this.num_heads = getRandomInt(116) + 5;
        const sub_weapon_idx = getRandomInt(subtracting_weapons.length);
        const sub_weapon = subtracting_weapons[sub_weapon_idx];

        // Make sure gcd of + and - weapons is 1, to guarantee that
        // puzzle is solveable.
        let add_weapon_idx = 0;
        let add_weapon = adding_weapons[add_weapon_idx];
        let count = 100;
        do {
            add_weapon_idx = getRandomInt(adding_weapons.length);
            add_weapon = adding_weapons[add_weapon_idx];
            count = count - 1;
        } while (count > 0 && gcd(sub_weapon['value'], add_weapon['value']) != 1);

        const div_weapon_idx = getRandomInt(dividing_weapons.length);
        const div_weapon = dividing_weapons[div_weapon_idx];

        this.weapons = [sub_weapon, add_weapon, div_weapon];
        this.hydra_color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

        // Set hp = 2x minimal number of moves.
        const solution = solve(this.num_heads, this.weapons);
        this.optimal_turns = solution.length;
        this.hp = 2 * solution.length
    }
}

var game = new Game();

function getWeaponString(weapon) {
    return weapon['name'] + ' ' + weapon['op'] + weapon['value'];
}

function canUse(weapon, num_heads) {
    switch (weapon['op']) {
        case '+': return true; break;
        case '-': return num_heads >= parseInt(weapon['value'], 10); break;
        case '/': return num_heads % parseInt(weapon['value'], 10) == 0; break;
        default: return false;
    }
}

function updateButtons(game) {
    const weapon1 = document.getElementById("weapon1");
    weapon1.innerText = getWeaponString(game.weapons[0]);
    weapon1.disabled = !canUse(game.weapons[0], game.num_heads);

    const weapon2 = document.getElementById("weapon2");
    weapon2.innerText = getWeaponString(game.weapons[1]);
    weapon2.disabled = !canUse(game.weapons[1], game.num_heads);

    const weapon3 = document.getElementById("weapon3");
    weapon3.innerText = getWeaponString(game.weapons[2]);
    weapon3.disabled = !canUse(game.weapons[2], game.num_heads);
}

function setStatus(game) {
    const hpElem = document.getElementById("hp");
    hpElem.innerText = "Your HP: " + game.hp;

    const headsElem = document.getElementById("heads");
    headsElem.innerText = "Heads: " + game.num_heads;
}

function updateSolution(game) {
    const solution = solve(game.num_heads, game.weapons);

    const solnElem = document.getElementById("soln");
    const solnShort = solution.map((x) => x.charAt(0));
    solnElem.innerText = solution.length + ' - ' + solnShort;
}

function winLose(game) {
    const winLoseElem = document.getElementById("winlose");
    const gameElem = document.getElementById("game");
    if (game.num_heads == 0 && game.hp >= 0) {
        if (game.hp == game.optimal_turns) {
            winLoseElem.innerText = "You are a hydra-slaying expert! You killed the hydra with the fewest hits possible!";
        } else if (game.hp == 0) {
            winLoseElem.innerText = "You killed the hydra just in time!";
        } else {
            winLoseElem.innerText = "Congratulations, you killed the hydra!";
        }
        winLoseElem.style.display = "block";
        gameElem.style.display = "none";
    } else if (game.hp < 0) {
        if (game.num_heads > 100) {
            winLoseElem.innerText = "Aaa! The hydra is out of control!";
        } else {
            winLoseElem.innerText = "Oh dear, the hydra killed you.";
        }
        winLoseElem.style.display = "block";
        gameElem.style.display = "none";
    } else {
        winLoseElem.innerText = "";
        winLoseElem.style.display = "none";
        gameElem.style.display = "block";
    }
}

function refreshPage() {
    updateButtons(game);
    setStatus(game);
    //updateSolution(game);
    winLose(game);
    const svg = document.querySelector("svg");
    const bodyColor = game.hydra_color;
    drawhydra(svg, bodyColor, game.num_heads);
}

function getNewNumHeads(weapon, curr_num_heads) {
    let heads = curr_num_heads;
    switch (weapon['op']) {
        case '+': heads += parseInt(weapon['value'], 10); break;
        case '-': heads -= parseInt(weapon['value'], 10); break;
        case '/': heads /= parseInt(weapon['value'], 10); break;
    }
    return heads;
}

function updateHeads(weaponNum) {
    game.num_heads = getNewNumHeads(game.weapons[weaponNum], game.num_heads);
    game.hp -= 1;

    refreshPage();
}

function newGame() {
    game = new Game();
    refreshPage();
}

window.onload = function () {
    newGame();
};

// --------------------------------------------------------------------------
// Auto Solving
// --------------------------------------------------------------------------

// returns a map of {num heads} -> {Node}, where Node has
// {num heads, score, weapon, parent num heads}.
function search(numHeads, weapons) {
    let start_node = { 'heads': numHeads, 'score': 0, 'weapon': '', 'parent': -1 };
    let visited = new Map();  // visited nodes; {num heads} -> {Node}
    let queue = [];  // nodes to visit

    queue.push(start_node);

    while (queue.length > 0) {
        let curr_node = queue.shift();
        if (visited.has(curr_node['heads'])) {
            continue;
        }
        visited.set(curr_node.heads, curr_node);
        if (curr_node.heads == 0) {
            break;
        }

        for (w of weapons) {
            if (!canUse(w, curr_node.heads)) {
                continue;
            }
            const new_heads = getNewNumHeads(w, curr_node.heads);

            const new_node = {
                'heads': new_heads,
                'score': +curr_node.score + +1,
                'weapon': w.name,
                'parent': curr_node.heads
            };
            if (!visited.has(new_node.heads)) {
                queue.push(new_node);
            }
        }
    }

    return visited;
}

// returns a list of weapon strings to solve the puzzle
function solve(num_heads, weapons) {
    const visited = search(num_heads, weapons);

    let curr_node = visited.get(0);
    let weaponList = [];
    while (curr_node.parent !== -1) {
        weaponList.push(curr_node.weapon);
        curr_node = visited.get(curr_node.parent);
    }
    weaponList.reverse();
    return weaponList;
}

// --------------------------------------------------------------------------
// Graphics
// --------------------------------------------------------------------------

const svgns = "http://www.w3.org/2000/svg";

function getbody(bodyColor) {
    const black = "#000000";

    const cx = 125;  // center of body
    const cy = 200;

    const bodygroup = document.createElementNS(svgns, 'g');
    const leg1 = document.createElementNS(svgns, 'path');
    leg1.setAttribute('d', "m 149.54643,248.76972 3.66261,28.35804 c 0,0 -17.26657,6.1872 -16.74335,10.31202 0.52323,4.1248 0.52323,7.2184 6.27875,7.2184 5.75552,0 29.30084,-8.2496 29.30084,-8.2496 l -1.04645,-46.40407 z");
    leg1.setAttribute('fill', bodyColor);
    leg1.setAttribute('stroke', black);
    const leg2 = document.createElementNS(svgns, 'path');
    leg2.setAttribute('d', "m 81.067129,234.65378 2.536058,36.68398 c 0,0 -17.266569,6.18721 -16.743346,10.31202 0.523235,4.1248 0.523235,3.88803 6.278746,3.88803 5.755523,0 28.737583,-4.36417 28.737583,-4.36417 l 1.20665,-45.84901 z");
    leg2.setAttribute('fill', bodyColor);
    leg2.setAttribute('stroke', black);
    const body = document.createElementNS(svgns, 'path');
    body.setAttribute('d', "m 53.272227,194.63164 c -0.259322,-33.39636 43.836277,-44.25503 79.007623,-43.82606 26.90708,-0.44941 64.47909,13.20893 68.78596,43.74714 0.52323,9.2808 -3.3823,25.85897 -3.3823,25.85897 0,0 11.51105,-1.54682 22.49887,-10.31203 9.92827,-7.91998 19.88271,-24.23323 19.88271,-24.23323 0,0 -2.0929,28.35803 -15.17364,39.18565 -13.08074,10.82761 -37.14929,14.95243 -37.14929,14.95243 l 1.56969,48.46647 c 0,0 -18.87497,10.50218 -29.30085,10.82761 -4.19099,0.13081 -12.03426,2.578 -12.03426,-3.60921 0,-6.1872 17.26656,-16.49922 17.26656,-16.49922 l -3.6626,-31.45164 c 0,0 -15.69689,4.12481 -31.39377,2.578 -15.69687,-1.5468 -36.868958,-9.75695 -36.868958,-9.75695 l -2.453316,56.67144 c 0,0 -22.418778,1.54939 -29.220758,0.002 -6.48908,-1.47565 -8.37167,-13.40563 -3.139378,-15.46803 5.232294,-2.0624 11.027862,-3.41189 11.027862,-3.41189 l -2.65619,-45.05198 c 0,0 -13.344641,-5.27369 -13.603965,-38.67006 z");
    body.setAttribute('fill', bodyColor);
    body.setAttribute('stroke', black);

    bodygroup.appendChild(leg1);
    bodygroup.appendChild(leg2);
    bodygroup.appendChild(body);

    return { 'center': [cx, cy], 'element': bodygroup };
}

function getrawhead(bodyColor, necklength) {
    const white = "#FFFFFF";
    const black = "#000000";

    const cx = 102;  // center of head
    const cy = 78;

    const headgroup = document.createElementNS(svgns, 'g');
    const teeth1 = document.createElementNS(svgns, 'path');
    teeth1.setAttribute("d", "m 84.27,76.98 1.74,2.24 1.12,-1.56 1.93,1.68 1.24,-2.56 z");
    teeth1.setAttribute('fill', white);
    teeth1.setAttribute('stroke', black);
    const teeth2 = document.createElementNS(svgns, 'path');
    teeth2.setAttribute("d", "m 85.77,82.34 1.18,-2.12 1.56,1.62 1.50,-1.87 1.43,2.49 z");
    teeth2.setAttribute('fill', white);
    teeth2.setAttribute('stroke', black);
    const head = document.createElementNS(svgns, 'path')
    head.setAttribute("d", `m 113.85,${93.20 + necklength} v ${-necklength} c -0.39,-13.25 1.51,-21.00 -1.93,-27.60 -3.44,-6.94 -15.56,-1.20 -17.54,5.45 -6.02,0.95 -4.07,0.34 -7.86,1.70 -2.11,0.76 -3.10,3.13 -2.33,4.22 5.18,0.06 8.21,-1.07 8.26,2.42 0.04,2.88 0.86,3.11 -6.71,2.95 -0.01,1.25 -0.40,1.81 1.68,3.46 2.39,1.90 3.86,1.24 8.08,0.02 0.05,1.57 -0.35,4.76 -0.37,7.37 v ${necklength}`);
    head.setAttribute('fill', bodyColor);
    head.setAttribute('stroke', black);
    const eye1 = document.createElementNS(svgns, 'ellipse');
    eye1.setAttribute('cx', 104.43);
    eye1.setAttribute('cy', 68.06);
    eye1.setAttribute('rx', 2.90);
    eye1.setAttribute('ry', 2.50);
    eye1.setAttribute('fill', white);
    eye1.setAttribute('stroke', black);
    const eye2 = document.createElementNS(svgns, 'ellipse');
    eye2.setAttribute('cx', 103.21);
    eye2.setAttribute('cy', 68.19);
    eye2.setAttribute('rx', 1.50);
    eye2.setAttribute('ry', 1.62);
    eye2.setAttribute('fill', black);

    headgroup.appendChild(teeth1);
    headgroup.appendChild(teeth2);
    headgroup.appendChild(head);
    headgroup.appendChild(eye1);
    headgroup.appendChild(eye2);

    return { 'center': [cx, cy], 'element': headgroup };
}

function drawhead(svg, hydra_group, color, headx, heady, bodyx, bodyy) {
    const dx = headx - bodyx;
    const dy = heady - bodyy;
    const r = Math.sqrt(dx * dx + dy * dy);
    const necklength = r;

    let head = getrawhead(color, necklength);
    const origx = head['center'][0];
    const origy = head['center'][1];
    let headelem = head['element'];

    const theta = Math.atan2(dx, -dy);

    let t1 = svg.createSVGTransform();
    t1.setTranslate(headx - origx, heady - origy);
    let t2 = svg.createSVGTransform();
    t2.setRotate(theta * 180 / Math.PI, origx, origy);
    const transformList = headelem.transform.baseVal;
    transformList.appendItem(t1);
    transformList.appendItem(t2);

    hydra_group.appendChild(headelem);
}

function drawhydra(svg, color, numheads) {
    // clear any previous stuff
    while (svg.firstChild) {
        svg.removeChild(svg.lastChild);
    }

    const hydra_group = document.createElementNS(svgns, 'g');
    svg.appendChild(hydra_group);

    let body = getbody(color);
    const bodyelement = body['element'];
    const bodyx = body['center'][0];
    const bodyy = body['center'][1];
    hydra_group.appendChild(bodyelement);

    // determine head locations
    const seed = getRandomInt(1000);
    let generator = getQuasirandom2DPoint(seed);
    let headlocs = []
    while (headlocs.length < numheads) {
        const loc = generator.next().value;
        // keep heads in an ellipse
        const dx = loc[0] - 0.5;
        const dy = loc[1] - 0.5;
        if (dx * dx + dy * dy < 0.5 * 0.5) {
            headlocs.push(loc);
        }
    }
    // Sort so that "lowest" heads are in the foreground, 
    // to reduce overlapping.
    headlocs.sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < numheads; i++) {
        const headx = headlocs[i][0] * 200 - 100 + bodyx;
        const heady = headlocs[i][1] * 130 + 50;
        const bodyxoffset = headlocs[i][0] * 140 - 70 + bodyx;
        const bodyyoffset = headlocs[i][1] * 40 - 40 + bodyy;
        drawhead(svg, hydra_group, color, headx, heady, bodyxoffset, bodyyoffset);
    }

    // Shift everything up a little bit.
    let t1 = svg.createSVGTransform();
    t1.setTranslate(0, -20);
    const transformList = hydra_group.transform.baseVal;
    transformList.appendItem(t1);
}

