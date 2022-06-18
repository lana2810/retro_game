import constant from "./constant";

export function calcTileType(index, boardSize) {
  // TODO: write logic here
  const top = (ind) => ind > 0 && ind < boardSize - 1 && ind;
  const bottom = (ind) => ind > boardSize ** 2 - boardSize && ind;
  const left = (ind) => ind % boardSize === 0 && ind;
  const right = (ind) => (ind + 1) % boardSize === 0 && ind;
  switch (index) {
    case 0:
      return "top-left";
    case boardSize - 1:
      return "top-right";
    case boardSize ** 2 - 1:
      return "bottom-right";
    case boardSize ** 2 - boardSize:
      return "bottom-left";
    case top(index):
      return "top";
    case bottom(index):
      return "bottom";
    case left(index):
      return "left";
    case right(index):
      return "right";
    default:
      return "center";
  }
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return "critical";
  }

  if (health < 50) {
    return "normal";
  }

  return "high";
}

export function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function column(n) {
  const arr = [];
  let rez = n;
  for (let i = 0; i < constant.boardSize; i++) {
    arr.push(rez);
    rez += constant.boardSize;
  }
  return arr;
}
export function row(n) {
  const arr = [];
  let rez = n * constant.boardSize;
  for (let i = 0; i < constant.boardSize; i++) {
    arr.push(rez);
    rez += 1;
  }
  return arr;
}
export function allowDistance(index, typeDistance) {
  const columnFirst = column(0);
  const columnLast = column(constant.boardSize - 1);
  const rowFirst = row(0);
  const rowLast = row(constant.boardSize - 1);
  const arr = [];

  // по горизонтали вправо
  let rez1 = index;
  let flag1 = true;
  // по горизонтали влево
  let rez2 = index;
  let flag2 = true;
  // по вертикали вверх
  let flag3 = true;
  let rez3 = index;
  // по вертикали вниз
  let flag4 = true;
  let rez4 = index;
  // по диагонале вверх вправо
  let flag5 = true;
  let rez5 = index;
  // по диагонале вниз вправо
  let flag6 = true;
  let rez6 = index;
  // по диагонале вверх влево
  let flag7 = true;
  let rez7 = index;
  // по диагонале вниз влево
  let flag8 = true;
  let rez8 = index;

  for (let i = 1; i <= typeDistance; i++) {
    if (flag1 && !columnLast.includes(rez1)) {
      arr.push(rez1 + 1);
      rez1 += 1;
    } else {
      flag1 = false;
    }
    if (!columnFirst.includes(rez2) && flag2) {
      arr.push(rez2 - 1);
      rez2 -= 1;
    } else {
      flag2 = false;
    }
    if (!rowFirst.includes(rez3) && flag3) {
      arr.push(rez3 - constant.boardSize);
      rez3 -= constant.boardSize;
    } else {
      flag3 = false;
    }
    if (!rowLast.includes(rez4) && flag4) {
      arr.push(rez4 + constant.boardSize);
      rez4 += constant.boardSize;
    } else {
      flag4 = false;
    }
    if (![...rowFirst, ...columnLast].includes(rez5) && flag5) {
      arr.push(1 + rez5 - constant.boardSize);
      rez5 = rez5 - constant.boardSize + 1;
    } else {
      flag5 = false;
    }
    if (![...rowLast, ...columnLast].includes(rez6) && flag6) {
      arr.push(1 + rez6 + constant.boardSize);
      rez6 = rez6 + constant.boardSize + 1;
    } else {
      flag6 = false;
    }
    if (![...rowFirst, ...columnFirst].includes(rez7) && flag7) {
      arr.push(rez7 - constant.boardSize - 1);
      rez7 = rez7 - constant.boardSize - 1;
    } else {
      flag7 = false;
    }
    if (![...rowLast, ...columnFirst].includes(rez8) && flag8) {
      arr.push(rez8 + constant.boardSize - 1);
      rez8 = rez8 + constant.boardSize - 1;
    } else {
      flag8 = false;
    }
  }
  return arr;
}
