export default class Character {
  constructor(level, type = "generic") {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 100;
    this.distance = 0;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    if (new.target.name === "Character") {
      throw new Error("Ошибка создания обьекта");
    }
  }
}
