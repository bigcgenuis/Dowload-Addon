import "./Command/cmd"
import { system, world } from "@minecraft/server";
import { getTime } from "../minecraft/timeGMT";
import { Database } from "../database/db";
let db = new Database('RealTimeSync');
if (db.get('gmtZone') === undefined) db.set('gmtZone', 7, 0);
if (db.get('timeSet') === undefined) db.set('timeSet', true, 0);
if (db.get('show') === undefined) db.set('show', false, 0);
if (db.get('type') === undefined) db.set('type', 'title', 0);
system.runInterval(() => {
    let { gameTime, gmtTime } = getTime(Number(db.get("gmtZone")));
    if (db.get(`timeSet`) === "true") {
        world.setTimeOfDay(gameTime);
    }
    let players = world.getAllPlayers();
    players.forEach(player => {
        if (db.get("show") === "true")
        player.runCommand(`title @s ${db.get("type")} ${gmtTime}`);
    });
});