import { system, world } from "@minecraft/server";

export function saveData(key, value) {
    system.run(() => {
        world.setDynamicProperty(key, JSON.stringify(value));
    });
}

export function loadData(key) {
    return new Promise((resolve) => {
        system.run(() => {
            let Data = world.getDynamicProperty(key);
            resolve(Data ? JSON.parse(Data) : {}); // ✅ คืนค่าผ่าน Promise
        });
    });
}
