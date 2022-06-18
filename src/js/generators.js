/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
import { getRandom } from "./utils";

export function* characterGenerator(allowedTypes, maxLevel) {
  const type = getRandom(0, allowedTypes.length - 1);
  const level = getRandom(1, maxLevel);
  yield new allowedTypes[type](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];

  while (team.length < characterCount) {
    const generator = characterGenerator(allowedTypes, maxLevel);
    team.push(generator.next().value);
  }
  return team;
}
