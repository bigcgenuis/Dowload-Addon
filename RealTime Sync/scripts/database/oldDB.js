import { world } from "@minecraft/server";
export function saveData(key, value) {
    world.setDynamicProperty(key, JSON.stringify(value));
}
export function loadData(key) {
    let Data = world.getDynamicProperty(key);
    return Data ? JSON.parse(Data) : {};
}