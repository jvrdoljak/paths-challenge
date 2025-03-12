
interface Position {
    i: number,
    j: number,
}

const validMap: Array<Array<String>> = [
    ['@','-','-','-','A','-','-','-','+'],
    ['','','','','','','','','|'],
    ['x','-','B','-','+','','','','C'],
    ['','','','','|','','','','|'],
    ['','','','','+','-','-','-','+'],
];

let nEI: Array<Position>;
let sP: Position;
let eP: Position;
let path: string;
let currentPosition: Position;

function getInitialValues(map: Array<Array<String>>, cb: (err: string | null, data?: {nonEmptyIndexes: Array<Position>, startPosition: Position, endPosition: Position}) => void) {
    const nonEmptyIndexes: Array<Position> = [];
    const startPositions: Array<Position> = [];
    const endPositions: Array<Position> = [];
    
    map.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value !== null && value !== "") {
                nonEmptyIndexes.push({i, j});
            }
            if(value == '@') {
                startPositions.push({i,j});
            }
            if(value == 'x') {
                endPositions.push({i,j});
            }

        });
    });

    if(startPositions.length > 1) {
        cb('This map has two starting positions.');
        return;
    }
    if(endPositions.length > 1) {
        cb('This map has two end positions.');
        return;
    }
    if(startPositions[0] == null || endPositions[0] == null) {
        cb('Start or end position is missing');
        return;
    }

    cb(null, {nonEmptyIndexes, startPosition: startPositions[0], endPosition: endPositions[0]});
}

function getNeighbours(nEI: Array<Position> , position: Position): Array<Position> {
    const {i,j} = position;
    const neighbourPositions = [{i: i+1, j},{i: i-1, j},{i, j:j+1},{i, j: j-1}];
    const neighbours: Array<Position> = [];

    neighbourPositions.forEach((e) => {
        if(nEI.findIndex((el) => {
            return el.i == e.i && el.j == e.j;
        }) != -1) {
            neighbours.push({i: e.i, j: e.j});
        }
    })

    return neighbours;
}

function nextStep(map: Array<Array<String>>, nEI: Array<Position>, sP: Position, position: Position) {
    const neighbours = getNeighbours(nEI, position ?? sP);
    console.log({neighbours});
}

getInitialValues(validMap, (err, data) => {
    if(err) {
        console.error(err);
        return;
    }
    if(data == null) return;

    nEI = data.nonEmptyIndexes;
    sP = data.startPosition;
    currentPosition = sP;
    eP = data.endPosition;

    nextStep(validMap, nEI, sP, currentPosition);

})

// getNeighbours(nEI, sP.i, sP.j);
