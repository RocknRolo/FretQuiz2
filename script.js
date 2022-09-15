// Auteur: Roel Kemp

const canvas = document.getElementById('canvas');
canvas.setAttribute("width", window.innerWidth+"");
canvas.setAttribute("height", "330");
canvas.addEventListener("mouseup", function(e) {
    readAnswer(canvas, e);
});
const ctx = canvas.getContext('2d');

const scaleDisplay = document.getElementById("fretboard");
scaleDisplay.style.fontSize = 1 + (innerWidth / 1000) + "rem";

// Hier kunnen snaren worden toegevoegd of worden verwijderd.
// "flatSharp" geeft aan of een toon verhoogd of verlaagd is.
// Als je een Bb snaar toe wilt voegen schrijf je dus: B, -1.
const TUNING = [
    new Tone("E", 0),
    new Tone("B", 0),
    new Tone("G", 0),
    new Tone("D", 0),
    new Tone("A", 0),
    new Tone("E", 0)
]

const FRETBOARD_X = 75;
const FRETBOARD_Y = 10;

const FRETBOARD_COLOR = "#000";
const FRETBOARD_MARGIN = 60;
const FRETBOARD_WIDTH = window.innerWidth - FRETBOARD_MARGIN;
const FRETBOARD_HEIGHT = FRETBOARD_WIDTH / 10 + 90;

const STRING_EDGE_SPACE = 15;
const STRING_COLOR = "#FFF";

const NR_OF_FRETS = 25; // incl. fret 0.
const FRET_SPACE_RATIO = 0.975;
const MAGIC = 1.04;
const FRET_COLOR = "#444";
const FRET_SIZE = 5;
const OCTAVE_FRET = 12;
const SEC_OCT_FRET = 24;

const INLAY_POSITIONS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
const INLAY_SIZE = 9;
const INLAY_COLOR = "#666";
const INLAY_TEXT_COLOR = "#FFF";
const TONE_X_OFFSET = 2;

const FB_NR_SPACING = 35;
const POS_NR_FONT = "2rem courier new";
const POS_NR_OFFSET = -8;
const TWO_DIGIT_OFFSET = -6;

const FRET_Xs = calcFretXs();
const TONE_Xs = calcToneXs();
const STRING_Ys = calcStringYs();
const FRET_Ys = calcFretYs();

const LABEL_SIZE = innerWidth / 220 + 10;
const LABEL_COLOR = "#F00" // Rood
const LABEL_COLOR_OPEN = "#111" // Donkergrijs
const LABEL_TEXT_FONT = (innerWidth / 1500) + 1 + "rem courier new";
const LABEL_TEXT_COLOR = "#FFF";
const LABEL_TEXT_X_OFFSET = -13;
const LABEL_TEXT_Y_OFFSET = 10;

function calcFretXs() {
    let fretSpacing = FRETBOARD_WIDTH / ((NR_OF_FRETS + 1) * Math.pow(FRET_SPACE_RATIO, NR_OF_FRETS)) * MAGIC;
    let fretXs = [];
    for (let i = 0; i < NR_OF_FRETS; i++) {
        let fretX = FRETBOARD_X + (i * fretSpacing);
        fretXs.push(fretX);
        fretSpacing *= FRET_SPACE_RATIO;
    }
    return fretXs;
}

function calcToneXs() {
    let toneXs = [];
    toneXs.push(FRETBOARD_X / 2); // <-- Voor de open snaar.
    for (let i = 1; i < NR_OF_FRETS; i++) {
        toneXs.push(FRET_Xs[i] - ((FRET_Xs[i] - (FRET_Xs[i-1])) / 2) + TONE_X_OFFSET);
    }
    return toneXs;
}

function calcStringYs() {
    let stringYs = [];
    for (let i = 0; i < TUNING.length; i++) {
        let stringY = FRETBOARD_Y + STRING_EDGE_SPACE + (i * ((FRETBOARD_HEIGHT - STRING_EDGE_SPACE * 2) / 
            (TUNING.length - 1))) - i;
        stringYs.push(stringY);
    }
    return stringYs;
}

function calcFretYs() {
    let fretYs = [0];
    for (let i = 1; i < TUNING.length; i++) {
        fretYs.push(STRING_Ys[i] - ((STRING_Ys[i] - (STRING_Ys[i-1])) / 2) + TONE_X_OFFSET);
    }
    // Voor de ondergrens
    fretYs.push(fretYs[fretYs.length - 1] + (fretYs[fretYs.length - 1] - fretYs[fretYs.length - 2]));
    return fretYs;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawFretboard() {
    ctx.beginPath();
    // Teken de toets.
    ctx.fillStyle = FRETBOARD_COLOR;
    ctx.fillRect(FRETBOARD_X, FRETBOARD_Y, FRETBOARD_WIDTH, FRETBOARD_HEIGHT);

    // Teken de frets.
    ctx.fillStyle = FRET_COLOR;
    for (let i = 0; i < calcFretXs().length; i++) {
        ctx.fillRect(FRET_Xs[i], FRETBOARD_Y, FRET_SIZE, FRETBOARD_HEIGHT);
    }

    // Teken de inlays en de positie nummers.
    ctx.font = POS_NR_FONT;
    for (let i = 0; i < INLAY_POSITIONS.length; i++) {
        ctx.fillStyle = INLAY_COLOR;
        if (INLAY_POSITIONS[i] === OCTAVE_FRET || INLAY_POSITIONS[i] === SEC_OCT_FRET) {
            ctx.beginPath();
            ctx.arc(TONE_Xs[INLAY_POSITIONS[i]], FRETBOARD_Y + (FRETBOARD_HEIGHT / 6 * 2), INLAY_SIZE, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(TONE_Xs[INLAY_POSITIONS[i]], FRETBOARD_Y + (FRETBOARD_HEIGHT / 6 * 4), INLAY_SIZE, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(TONE_Xs[INLAY_POSITIONS[i]], FRETBOARD_Y + FRETBOARD_HEIGHT / 2, INLAY_SIZE,
                0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.fillStyle = INLAY_TEXT_COLOR;
        ctx.fillText(""+INLAY_POSITIONS[i],
            TONE_Xs[INLAY_POSITIONS[i]] + POS_NR_OFFSET + (INLAY_POSITIONS[i] > 9 ? TWO_DIGIT_OFFSET : 0),
            FRETBOARD_Y + FRETBOARD_HEIGHT + FB_NR_SPACING);
    }

    // Teken de snaren.
    ctx.fillStyle = STRING_COLOR;
    for (let i = 0; i < STRING_Ys.length; i++) {
        ctx.fillRect(0, STRING_Ys[i], FRETBOARD_X + FRETBOARD_WIDTH,i + 1);
    }
    // Teken de labels voor de open snaren.
    ctx.fillStyle = LABEL_COLOR_OPEN;
    for (let i = 0; i < STRING_Ys.length; i++) {
        drawToneTextLabel(0, i, TUNING[i].toString());
    }
}

function drawToneLabel (fingerPos, stringNum) {
    ctx.beginPath();
    ctx.arc(TONE_Xs[fingerPos], STRING_Ys[stringNum], LABEL_SIZE, 0, 2 * Math.PI);
    ctx.fill();
}

function drawToneTextLabel (fingerPos, stringNum, text) {
    ctx.fillStyle = LABEL_COLOR_OPEN;
    drawToneLabel(fingerPos, stringNum);
    ctx.fillStyle = LABEL_TEXT_COLOR;
    ctx.beginPath();
    ctx.fillText(text, TONE_Xs[fingerPos] + LABEL_TEXT_X_OFFSET, STRING_Ys[stringNum] + LABEL_TEXT_Y_OFFSET, LABEL_SIZE * 1.5);
}

function reDrawFretboard() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawFretboard();
    ctx.fillStyle = LABEL_COLOR;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const SEMITONES = "C D EF G A B";
const FLATTONES = "ABDE";

let correctTone;
let answerTone;

let score = 0;
let mistakes = 0;

function Tone(natural, flatSharp) {
    this.natural = natural;
    this.flatSharp = parseInt(flatSharp);

    this.toString = () => {
        let accidentals = "";
        for (let i = 0; i < Math.abs(flatSharp); i++) {
            accidentals += (flatSharp < 0 ? "b" : "#");
        }
        return "" + natural + accidentals;
    }
}

// Deze functie ontvangt 2 Tone objecten en geeft het aantal halve tonen ertussen terug.
// Het eerste Tone object wordt altijd als lager gezien dan het 2de Tone object.
// Het getal dat je terugkrijgt als je vergelijkt met "C, 0" correspondeert aan de antwoordknoppen in de GUI.
function semitonesBetween(tone1, tone2) {
    let index1 = SEMITONES.indexOf(tone1.natural) + tone1.flatSharp;
    let index2 = SEMITONES.indexOf(tone2.natural) + tone2.flatSharp;
    return (Math.max(index1, index2) - Math.min(index1, index2)) % 12;
}


function question() {
    correctTone = new Tone(String.fromCharCode(65 + Math.floor(Math.random() * 7)), -1 + Math.floor(Math.random() * 3));
    document.getElementById('question').textContent = "Where is: " + correctTone + " ?";
}

function checkAnswer() {
    if (semitonesBetween(correctTone, answerTone) === 0) {
        score++;
        question();
    } else {
        score--;
        mistakes++;
    }
    updateScore();
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('mistakes').textContent = mistakes;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function readAnswer(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    answerTone = posToTone(x, y);
    checkAnswer();
}

function posToTone(x, y) {
    if (x > FRET_Xs[FRET_Xs.length - 1] || y > FRET_Ys[FRET_Ys.length - 1]) {
        return null;
    }

    let fretXs = [...FRET_Xs];
    fretXs.unshift(0);

    let fretNum;
    for (let i = 0; i < fretXs.length - 1; i++) {
        if (x > fretXs[i] && x < fretXs[i + 1]) {
            fretNum = i;
        }
    }

    let stringChar;
    for (let i = 0; i < FRET_Ys.length - 1; i++) {
        if (y > FRET_Ys[i] && y < FRET_Ys[i + 1]) {
            stringChar = TUNING[i].natural;
        }
    } 

    //console.log(stringChar + " " + fretNum);
    return new Tone(stringChar, fretNum);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

drawFretboard();
question();

