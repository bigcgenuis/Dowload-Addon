import { world } from "@minecraft/server";
import { Database } from "../../database/db";
let db = new Database('RealTimeSync');
world.beforeEvents.chatSend.subscribe(e => {
    let player = e.sender;
    let message = e.message;
    if (!message.startsWith('!')) player.sendMessage(`§cInvalid command. Use !help for a list of commands.`);
    if (message.startsWith(`!help`) && player.hasTag(`Admin`)) {
        e.cancel = true;
        player.sendMessage(`§2----- Help command -----\n§r!setgmt [gmtZone: Number] // Example: !setgmt 7\n!realtime [onRealTime: Boolean] // Example: !realtime true\n!showtime [onShowTime: Boolean] // Example: !showtime true\n!msgtype [messageType: title, actionbar] // Example: !msgtype title\n§2----------------------`);
    } else if (message.startsWith(`!setgmt`) && player.hasTag(`Admin`)) {
        e.cancel = true;
        let args = message.split(' ');
        if (args.length === 2 && !isNaN(args[1])) {
            let gmtZone = parseInt(args[1]);
            db.replace('gmtZone', gmtZone, 0);
            player.sendMessage(`§eGMT zone set to: §a${gmtZone}`);
        } else {
            player.sendMessage(`§cInvalid command usage. Example: !setgmt 7`);
        }
    } else if (message.startsWith(`!realtime`) && player.hasTag(`Admin`)) {
        e.cancel = true;
        let args = message.split(' ');
        if (args.length === 2 && (args[1] === 'true' || args[1] === 'false')) {
            let onRealTime = args[1] === 'true';
            db.replace('timeSet', onRealTime, 0);
            player.sendMessage(`§eReal time sync set to: §a${onRealTime}`);
        } else {
            player.sendMessage(`§cInvalid command usage. Example: !realtime true`);
        }
    } else if (message.startsWith(`!showtime`) && player.hasTag(`Admin`)) {
        e.cancel = true;
        let args = message.split(' ');
        if (args.length === 2 && (args[1] === 'true' || args[1] === 'false')) {
            let onShowTime = args[1] === 'true';
            db.replace('show', onShowTime, 0);
            player.sendMessage(`§eShow time set to: §a${onShowTime}`);
        } else {
            player.sendMessage(`§cInvalid command usage. Example: !showtime true`);
        }
    } else if (message.startsWith(`!msgtype`) && player.hasTag(`Admin`)) {
        e.cancel = true;
        let args = message.split(' ');
        if (args.length === 2 && (args[1] === 'title' || args[1] === 'actionbar')) {
            let messageType = args[1];
            db.replace('type', messageType, 0);
            player.sendMessage(`§eMessage type set to: §a${messageType}`);
        } else {
            player.sendMessage(`§cInvalid command usage. Example: !msgtype title`);
        }
    } else {
        player.sendMessage(`§cInvalid command. Use !help for a list of commands.`);
    }
    if (message.startsWith('!')) return e.cancel = true
});