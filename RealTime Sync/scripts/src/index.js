import "./Command/cmd";
import { system, world } from "@minecraft/server";
import { getTime } from "../minecraft/timeGMT";
import { Database } from "../database/Scoreboard Db";

let db = new Database('RealTimeSync');

async function initializeDatabase() {
    if (await db.get('gmtZone') === undefined || !await db.get('gmtZone')) db.set('gmtZone', 7, 0);
    if (await db.get('timeSet') === undefined || !await db.get('timeSet')) db.set('timeSet', true, 0);
    if (await db.get('show') === undefined || !await db.get('show')) db.set('show', false, 0);
    if (await db.get('type') === undefined || !await db.get('type')) db.set('type', 'title', 0);
}

initializeDatabase().then(() => {
    system.runInterval(async () => {
        let { gameTime, gmtTime } = getTime(Number(await db.get("gmtZone")));
        if (await db.get(`timeSet`) === "true") {
            world.setTimeOfDay(gameTime);
        }
        let players = world.getAllPlayers();
        players.forEach(async player => {
            if (await db.get("show") === "true")
                player.runCommand(`title @s ${await db.get("type")} ${gmtTime}`);
        });
    });
});