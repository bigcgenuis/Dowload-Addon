import { world } from "@minecraft/server";

export function time(callback) {
    let time = world.getTimeOfDay();
    let hours = Math.floor((time / 1000 + 6) % 24);
    let minutes = Math.floor((time % 1000) * 0.06);
    let gameTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    callback(gameTime);
}