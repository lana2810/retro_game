import Character from "../Character";

export default class Daemon extends Character {
  constructor(level) {
    super(level, "daemon");
    this.attack = 25;
    this.defence = 25;
    this.distance = 1;
    this.distanceAttack = 4;
  }
}
