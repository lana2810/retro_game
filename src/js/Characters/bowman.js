import Character from "../Character";

export default class Bowman extends Character {
  constructor(level) {
    super(level, "bowman");
    this.attack = 25;
    this.defence = 25;
    this.distance = 4;
    this.distanceAttack = 2;
  }
}
