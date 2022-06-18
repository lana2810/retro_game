export default class GameState {
  constructor() {
    this.level = 0;
    this.pointsPlayer = 0;
    this.allPositionsCharacter = [];
    this.movePlayer = true;
  }

  static from(object) {
    // TODO: create object
    return object;
  }
}
