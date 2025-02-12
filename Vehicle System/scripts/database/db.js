import { system, world, ScoreboardIdentityType } from "@minecraft/server";
/**
 * @example
 * let db = new Database('database')
 * db.load(key);
 * db.get(key);
 * db.set(key, "Data", 1);
 * db.clear(key)
 */
export class Database {
    constructor(name) {
        this.name = name;
    }
    ScoreboardDatabase() {
        return world.scoreboard.getObjective(this.name).getParticipants().filter(i => i.type === ScoreboardIdentityType.FakePlayer).map(i => i.displayName);
    }
    save(key, value, score) {
        system.run(() => {
            world.getDimension("overworld").runCommand(`scoreboard objectives add ${this.name} dummy`);
            world.getDimension("overworld").runCommand(`scoreboard players set "${key}:${value}" ${this.name} ${score}`);
        });
    }
    load(key) {
        return this.ScoreboardDatabase().filter(start => start.startsWith(`${key}:`)).join('').split(":")[1];
    }
    set(key, value, score) {
        this.save(key, value, score);
    }
    get(key) {
        return this.load(key);
    }
    clear(key) {
        system.run(() => {
            world.getDimension("overworld").runCommand(`scoreboard players reset "${this.ScoreboardDatabase(this.name).filter(start => start.startsWith(`${key}:`))[0]}" ${this.name}`);
        });
    }
    replace(key, value, score) {
        this.clear(key);
        this.save(key, value, score);
    }
    delete() {
        system.run(() => {
            world.getDimension("overworld").runCommand(`scoreboard objectives remove ${this.name}`);
        });
    }
}