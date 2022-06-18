/* eslint-disable class-methods-use-this */
import { generateTeam } from "./generators";
import Undead from "./Characters/undead";
import Vampire from "./Characters/vampire";
import Magician from "./Characters/magician";
import Bowman from "./Characters/bowman";
import Swordsman from "./Characters/swordsman";
import Daemon from "./Characters/daemon";
import themes from "./themes";
import PositionedCharacter from "./PositionedCharacter";
import { getRandom, column, allowDistance } from "./utils";
import constant from "./constant";
import GamePlay from "./GamePlay";
import GameState from "./GameState";
import cursors from "./cursors";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.allPositions = [];
    this.gameState = new GameState();
    this.selectedCell = null;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gameState.points = 0;

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));

    this.newGame();

    window.setInterval(() => {
      if (!this.gameState.movePlayer) this.moveComputer();
    }, 2000);
  }

  newGame() {
    this.gameState.level++;
    let num = 0;

    if (this.gameState.level !== 1) {
      this.allPositions.forEach((it) => {
        if (this.isPlayerTeam(it)) num++;
        it.character.level++;
        it.character.health =
          it.character.health + 80 > 100 ? 100 : it.character.health + 80;
        it.character.attack = Math.max(
          it.character.attack,
          Math.round((it.character.attack * (1.8 - it.character.health)) / 100)
        );
        it.character.defence = Math.max(
          it.character.defence,
          Math.round((it.character.defence * (1.8 - it.character.health)) / 100)
        );
      });
    }

    switch (this.gameState.level) {
      case 1:
        this.gamePlay.drawUi(themes.prairie);
        this.generateTeam([Daemon, Undead, Vampire], 1, 2);
        this.generateTeam([Bowman, Swordsman, Magician], 1, 2);
        break;
      case 2:
        this.gamePlay.drawUi(themes.desert);
        this.generateTeam([Bowman, Swordsman, Magician], 1, 1);
        this.generateTeam([Daemon, Undead, Vampire], 2, num + 1);
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        this.generateTeam([Bowman, Swordsman, Magician], 2, 2);
        this.generateTeam([Daemon, Undead, Vampire], 3, num + 1);
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        this.generateTeam([Bowman, Swordsman, Magician], 3, 2);
        this.generateTeam([Daemon, Undead, Vampire], 4, num + 1);
        break;
      default:
        GamePlay.showMessage(
          `Конец игры! Количество очков ${this.gameState.points}`
        );
        this.allPositions = [];
        this.gamePlay.redrawPositions(this.allPositions);
        break;
    }
  }

  generateTeam(allowTypes, level, numberCharacter) {
    const team = generateTeam(allowTypes, level, numberCharacter);
    let value = [];
    if (level === 1 && allowTypes.includes(Bowman)) {
      value = [...column(0), ...column(1)];
    } else if (level === 1 && allowTypes.includes(Daemon)) {
      value = [
        ...column(constant.boardSize - 2),
        ...column(constant.boardSize - 1),
      ];
    } else {
      for (let i = 0; i < constant.boardSize ** 2; i++) {
        value.push(i);
      }
    }
    team.forEach((item) => {
      let index = getRandom(0, value.length - 1);
      const positions = this.allPositions.map((it) => it.position);
      while (positions.includes(value[index])) {
        index = getRandom(0, value.length - 1);
      }
      this.allPositions.push(new PositionedCharacter(item, value[index]));
    });
    this.gamePlay.redrawPositions(this.allPositions);
  }

  async goAttack(attacker, target) {
    GamePlay.showMessage("Ура!! Атака!");
    this.allPositions.forEach((it) => this.gamePlay.deselectCell(it.position));
    const damage = Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1
    );

    await this.gamePlay.showDamage(target.position, damage);
    target.character.health -= damage;
    if (target.character.health <= 0) {
      GamePlay.showMessage("Убит!");
      this.allPositions = this.allPositions.filter(
        (it) => it.position !== target.position
      );
    }
    this.gamePlay.redrawPositions(this.allPositions);
    this.isOver();
  }

  isOver() {
    const allCharacterComputer = this.allPositions.filter((it) => this.isComputerTeam(it));
    const allCharacterPlayer = this.allPositions.filter((it) => this.isPlayerTeam(it));

    if (allCharacterComputer.length === 0) {
      GamePlay.showMessage("Победа Игрока! Переход на другой уровень");
      this.gameState.points += allCharacterPlayer.reduce(
        (sum, it) => sum + it.character.health,
        0
      );
      this.newGame();
    }
    if (allCharacterPlayer.length === 0) {
      GamePlay.showMessage(
        "Победа Искуственного интеллекта!  Переход на другой уровень"
      );
      this.newGame();
    }
  }

  goMove(item, index) {
    this.allPositions.forEach((it) => this.gamePlay.deselectCell(it.position));
    this.allPositions = this.allPositions.filter((it) => it.position !== item.position);

    item.position = index;
    this.allPositions.push(item);
    this.gamePlay.redrawPositions(this.allPositions);
  }

  moveComputer() {
    this.gameState.movePlayer = true;
    GamePlay.showMessage("Ход компьютера!");

    const allCharacterComputer = this.allPositions.filter((it) => this.isComputerTeam(it));

    const allPositionsPlayer = this.allPositions
      .filter((it) => this.isPlayerTeam(it))
      .map((it) => it.position);

    let isAttack = false;

    allCharacterComputer.forEach((item) => {
      const distanceAttackCharacter = allowDistance(
        item.position,
        item.character.distanceAttack
      );

      allPositionsPlayer.forEach((it) => {
        if (distanceAttackCharacter.includes(it) && !isAttack) {
          const target = this.allPositions.filter((i) => i.position === it);
          const attacker = this.allPositions.filter(
            (j) => j.position === item.position
          );
          this.goAttack(attacker[0], target[0]);
          isAttack = true;
        }
      });
    });
    if (!isAttack) {
      const indexRandomCharacter = getRandom(
        0,
        allCharacterComputer.length - 1
      );
      const randomCharacter = allCharacterComputer[indexRandomCharacter];
      const distanceMoveCharacter = allowDistance(
        randomCharacter.position,
        randomCharacter.character.distance
      );
      let index = getRandom(0, distanceMoveCharacter.length - 1);

      const positions = this.allPositions.map((it) => it.position);

      while (positions.includes(distanceMoveCharacter[index])) {
        index = getRandom(0, distanceMoveCharacter.length - 1);
      }
      this.goMove(randomCharacter, distanceMoveCharacter[index]);
    }
  }

  movePlayer(item, index) {
    if (item && this.isPlayerTeam(item)) {
      this.allPositions.forEach((it) =>
        this.gamePlay.deselectCell(it.position)
      );
      this.gamePlay.selectCell(index);
      this.selectedCell = item;
    }

    if (item && this.isComputerTeam(item)) {
      if (this.selectedCell) {
        const distanceAttack = allowDistance(
          this.selectedCell.position,
          this.selectedCell.character.distanceAttack
        );
        if (distanceAttack.includes(index)) {
          this.goAttack(this.selectedCell, item);
          this.selectedCell = null;
          this.gameState.movePlayer = false;
        } else {
          GamePlay.showError("Слишком далеко!");
        }
      } else {
        GamePlay.showError("Не Ваш персонаж!");
      }
    }

    if (this.selectedCell && item === null) {
      const distanceMove = allowDistance(
        this.selectedCell.position,
        this.selectedCell.character.distance
      );
      if (distanceMove.includes(index)) {
        this.goMove(this.selectedCell, index);
        this.selectedCell = null;
        this.gameState.movePlayer = false;
      } else {
        GamePlay.showError("Ошибка хода!");
      }
    }
  }

  onSaveGameClick() {
    this.gameState.allPositionsCharacter = this.allPositions;
    this.stateService.save(this.gameState);
    GamePlay.showMessage("Игра сохранена");
  }
  onLoadGameClick() {
    const state = this.stateService.load();
    if (!state) throw new Error("Ошибка загрузки игры!");
    const { allPositionsCharacter, level, movePlayer } = state;

    switch (level) {
      case 1:
        this.gamePlay.drawUi(themes.prairie);
        break;
      case 2:
        this.gamePlay.drawUi(themes.desert);
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        break;
    }

    this.allPositions = [];
    allPositionsCharacter.forEach((it) => {
      let character;
      switch (it.character.type) {
        case "swordsman":
          character = new Swordsman(it.character.level);
          break;
        case "bowman":
          character = new Bowman(it.character.level);
          break;
        case "magician":
          character = new Magician(it.character.level);
          break;
        case "undead":
          character = new Undead(it.character.level);
          break;
        case "vampire":
          character = new Vampire(it.character.level);
          break;
        case "daemon":
          character = new Daemon(it.character.level);
          break;
      }
      character.attack = it.character.attack;
      character.defence = it.character.defence;
      character.health = it.character.health;

      this.allPositions.push(new PositionedCharacter(character, it.position));
    });
    this.gamePlay.level = level;
    this.gamePlay.redrawPositions(this.allPositions);
    this.gameState.movePlayer = movePlayer;
  }

  onNewGameClick() {
    this.allPositions = [];
    this.gamePlay.redrawPositions([]);
    this.gameState.level = 0;
    this.gameState.movePlayer = true;
    this.newGame();
  }

  onCellClick(index) {
    // TODO: react to click
    const item = this.allPositions.find((it) => it.position === index) || null;
    this.movePlayer(item, index);
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const item = this.allPositions.find((it) => it.position === index) || null;
    if (item) {
      let message = `${String.fromCodePoint(0x1f396)}${item.character.level}`;
      message += `${String.fromCodePoint(0x2694)}${item.character.attack}`;
      message += `${String.fromCodePoint(0x1f6e1)}${item.character.defence}`;
      message += `${String.fromCodePoint(0x2764)}${item.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
    if (item && this.isPlayerTeam(item)) {
      this.gamePlay.setCursor(cursors.pointer);
    } else if (this.selectedCell) {
      const distanceAttack = allowDistance(
        this.selectedCell.position,
        this.selectedCell.character.distanceAttack
      );
      const distanceMove = allowDistance(
        this.selectedCell.position,
        this.selectedCell.character.distance
      );

      if (item && this.isComputerTeam(item) && distanceAttack.includes(index)) {
        this.gamePlay.selectCell(index, "red");
        this.gamePlay.setCursor(cursors.crosshair);
      } else if (distanceMove.includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, "green");
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    } else {
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    if (this.selectedCell && index !== this.selectedCell.position) {
      this.gamePlay.deselectCell(index);
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  isComputerTeam(item) {
    return (
      item.character instanceof Daemon ||
      item.character instanceof Undead ||
      item.character instanceof Vampire
    );
  }

  isPlayerTeam(item) {
    return (
      item.character instanceof Magician ||
      item.character instanceof Bowman ||
      item.character instanceof Swordsman
    );
  }
}
