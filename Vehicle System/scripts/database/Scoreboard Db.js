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
    ScoreboardDatabase(callback) {
        system.run(() => {
            world.getDimension(`overworld`).runCommand(`scoreboard objectives add ${this.name} dummy`)
        })
        system.run(() => {
            const result = world.scoreboard.getObjective(this.name).getParticipants().filter(i => i.type === ScoreboardIdentityType.FakePlayer).map(i => i.displayName);
            callback(result);
        });
    }
    save(key, value, score) {
        system.run(() => {
            world.getDimension("overworld").runCommand(`scoreboard players set "${key}:${value}" ${this.name} ${score}`);
        });
    }
    load(key) {
        return new Promise((resolve) => {
            this.ScoreboardDatabase((result) => {
                resolve(result.filter(start => start.startsWith(`${key}:`)).join('').split(":")[1]);
            });
        });
    }
    set(key, value, score) {
            system.run(() => {
                world.getDimension("overworld").runCommand(`scoreboard players set "${key}:${value}" ${this.name} ${score}`);
            });
    }
    async get(key) {
            return await this.load(key);
    }
    delete(key) {
        this.ScoreboardDatabase((result) => {
            const entry = result.filter(start => start.startsWith(`${key}:`))[0];
            if (entry) {
                system.run(() => {
                    world.getDimension("overworld").runCommand(`scoreboard players reset "${entry}" ${this.name}`);
                });
            }
        });
    }
    clear() {
        system.run(() => {
            world.getDimension("overworld").runCommand(`scoreboard objectives remove ${this.name}`);
        });
    }
    replace(key, value, score) {
        this.delete(key);
        this.set(key, value, score);
    }
}