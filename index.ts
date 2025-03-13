enum Direction {
  Initial = "Initial",
  N = "N",
  W = "W",
  S = "S",
  E = "E",
}

interface Position {
  i: number;
  j: number;
  direction: Direction;
  value: string;
}

const maps = [
  [
    ["@", "-", "-", "-", "A", "-", "-", "-", "+"],
    ["", "", "", "", "", "", "", "", "|"],
    ["x", "-", "B", "-", "+", "", "", "", "C"],
    ["", "", "", "", "|", "", "", "", "|"],
    ["", "", "", "", "+", "-", "-", "-", "+"],
  ],
  [
    ["@", "", "", "", "", "", "", "", "", ""],
    ["|", "", "+", "-", "C", "-", "-", "+", "", ""],
    ["A", "", "|", "", "", "", "", "|", "", ""],
    ["+", "-", "-", "-", "B", "-", "-", "+", "", ""],
    ["", "", "|", "", "", "", "", "", "", "x"],
    ["", "", "|", "", "", "", "", "", "", "|"],
    ["", "", "+", "-", "-", "-", "D", "-", "-", "+"],
  ],
  [
    ["@", "-", "-", "-", "A", "-", "-", "-", "+"],
    ["", "", "", "", "", "", "", "", "|"],
    ["x", "-", "B", "-", "+", "", "", "", "|"],
    ["", "", "", "", "|", "", "", "", "|"],
    ["", "", "", "", "+", "-", "-", "-", "C"],
  ],
  [
    ["", "", "", "", "+", "-", "O", "-", "N", "-", "+", "", ""],
    ["", "", "", "", "|", "", "", "", "", "", "|", "", ""],
    ["", "", "", "", "|", "", "", "", "+", "-", "I", "-", "+"],
    ["@", "-", "G", "-", "O", "-", "+", "", "|", "", "|", "", "|"],
    ["", "", "", "", "|", "", "|", "", "+", "-", "+", "", "E"],
    ["", "", "", "", "+", "-", "+", "", "", "", "", "", "S"],
    ["", "", "", "", "", "", "", "", "", "", "", "", "|"],
    ["", "", "", "", "", "", "", "", "", "", "", "", "x"],
  ],
  [
    ["@", "-", "-", "A", "-", "+", "", ""],
    ["", "", "", "", "", "|", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "B", "-", "x"],
  ],
];

const initialMap = maps[Number(process.argv[2]) ?? 0] ?? maps[0];
const workingMap: Array<Array<Position>> = [];
const path: Array<Position> = [];
const startCharacter = "@";
const endCharacter = "x";
const turnCharacter = "+";

function getInitialValues(
  map: Array<Array<string>>,
  cb: (
    err: string | null,
    data?: {
      startPosition: Position;
    },
  ) => void,
) {
  const startPositions: Array<Position> = [];
  const endPositions: Array<Position> = [];

  map.forEach((row, i) => {
    workingMap.push([]);
    row.forEach((value, j) => {
      workingMap[i].push({ i, j, direction: Direction.Initial, value });
      if (value == startCharacter) {
        startPositions.push({ i, j, direction: Direction.Initial, value });
      }
      if (value == endCharacter) {
        endPositions.push({ i, j, direction: Direction.Initial, value });
      }
    });
  });

  if (startPositions.length > 1) {
    cb("Multiple starts.");
    return;
  }
  if (endPositions.length > 1) {
    cb("Multiple ends.");
    return;
  }
  if (startPositions.length < 1) {
    cb("Missing start character.");
    return;
  }
  if (endPositions.length < 1) {
    cb("Missing end character.");
    return;
  }

  cb(null, {
    startPosition: startPositions[0],
  });
}

function oppositeDirection(direction: Direction) {
  switch (direction) {
    case Direction.N:
      return Direction.S;
    case Direction.E:
      return Direction.W;
    case Direction.S:
      return Direction.N;
    case Direction.W:
      return Direction.E;
    default:
      return direction;
  }
}

function isPossibleNeighbourInsideMap(
  possiblePosition: Position,
  workingMap: Array<Array<Position>>,
): boolean {
  return (
    possiblePosition.i >= 0 &&
    possiblePosition.i < workingMap.length &&
    possiblePosition.j >= 0 &&
    possiblePosition.j < workingMap[possiblePosition.i].length
  );
}

function getPossibleNeighbours(i: number, j: number): Array<Position> {
  return [
    { i, j: j - 1, direction: Direction.W, value: "" },
    { i, j: j + 1, direction: Direction.E, value: "" },
    { i: i - 1, j, direction: Direction.N, value: "" },
    { i: i + 1, j, direction: Direction.S, value: "" },
  ];
}

function getValidNeighbours(
  position: Position,
  cb: (err: string | null, data?: Array<Position>) => void,
) {
  const neighbours: Array<Position> = [];
  const { i: currentI, j: currentJ } = position;
  const possibleNeighbours: Array<Position> = getPossibleNeighbours(
    currentI,
    currentJ,
  );
  possibleNeighbours.forEach((possibleNeighbour) => {
    if (isPossibleNeighbourInsideMap(possibleNeighbour, workingMap)) {
      if (
        workingMap[possibleNeighbour.i][possibleNeighbour.j].value != "" &&
        possibleNeighbour.direction !=
          oppositeDirection(workingMap[currentI][currentJ].direction)
      ) {
        neighbours.push({
          ...workingMap[possibleNeighbour.i][possibleNeighbour.j],
          direction: possibleNeighbour.direction,
        });
      }
    }
  });

  if (neighbours.length != 0 && position.value == turnCharacter) {
    if (
      neighbours.filter(
        (e) =>
          e.direction != position.direction &&
          e.direction != oppositeDirection(position.direction),
      ).length == 0
    ) {
      cb("Fake turn.");
      return;
    }
  }
  cb(null, neighbours);
}

function nextStep(
  map: Array<Array<String>>,
  startPosition: Position,
  currentPosition: Position,
  cb: (err?: string) => void,
) {
  let neighbours: Array<Position> | undefined;
  getValidNeighbours(currentPosition, (err, data) => {
    if (err) {
      console.error("Error: ", err);
      return;
    }
    
    neighbours = data;
  });

  if (!neighbours) return;

  if (neighbours.length == 0) cb("Broken path.");

  const neighbour =
    neighbours.length == 1
      ? neighbours[0]
      : neighbours.find((a) => a.direction == currentPosition.direction);

  if (!!neighbour) {
    if (workingMap[neighbour.i][neighbour.j].direction == Direction.Initial) {
      path.push(workingMap[neighbour.i][neighbour.j]);
    }
    workingMap[neighbour.i][neighbour.j].direction = neighbour.direction;

    if (workingMap[neighbour.i][neighbour.j].value == endCharacter) return;

    nextStep(
      map,
      startPosition,
      {
        i: neighbour.i,
        j: neighbour.j,
        direction: neighbour.direction,
        value: neighbour.value,
      },
      (err) => {
        if (err) console.error("Error:", err);
      },
    );
  } else {
    cb("Error");
  }
}

getInitialValues(initialMap, (err, data) => {
  if (err) {
    console.error("Error:", err);
    return;
  }

  if (data == null) return;

  nextStep(initialMap, data.startPosition, data.startPosition, (err) => {
    if (err) console.error("Error:", err);
  });

  let displayPath = startCharacter;

  path.forEach((e) => {
    displayPath += e.value;
  });

  const displayWord = displayPath.match(/[A-Z]/g)?.join("");

  console.log({ displayPath });
  console.log({ displayWord });
});
