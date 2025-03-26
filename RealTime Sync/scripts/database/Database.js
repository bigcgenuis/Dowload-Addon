import { system, world } from "@minecraft/server";

class Database {
    constructor() {
        this.data = new Map();
        system.run(() => {
            this.StartDatabase();
        })
    }
    load(key) {
        let storedData = world.getDynamicProperty(key);
        if (storedData) {
            this.data.set(key, JSON.parse(storedData));
        }
        return this;
    }
    StartDatabase() {
        const keys = world.getDynamicPropertyIds();
        for (const key of keys) {
            this.load(key);
        }
    }
    save(key) {
        const value = this.data.get(key);
        if (value !== undefined) {
            world.setDynamicProperty(key, JSON.stringify(value));
        }
    }
    saveAll() {
        for (const [key, value] of this.data.entries()) {
            this.save(key);
        }
    }
    get(key) {
        this.load(key);
        return this.data.get(key);
    }
    set(key, value) {
        this.data.set(key, value);
        this.save(key);
        this.load(key);
    }
    delete(key) {
        if (this.data.has(key)) {
            this.data.delete(key);
            world.setDynamicProperty(key, null);
            this.load(key);
        }
    }
    has(key) {
        this.load(key);
        return this.data.has(key);
    }
    clear() {
        for (const key of this.data.keys()) {
            world.setDynamicProperty(key, null);
        }
        this.data.clear();
    }
    destroy() {
        this.saveAll();
    }
}

export default Database;