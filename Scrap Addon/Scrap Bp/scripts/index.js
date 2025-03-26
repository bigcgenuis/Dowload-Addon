import { world, system } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

var scData = {};

function saveData() {
    world.setDynamicProperty("scData", JSON.stringify(scData));
}

function loadData() {
    let data = world.getDynamicProperty("scData");
    if (data) {
        scData = JSON.parse(data);
    }
}

loadData();

if (!scData.ms) {
    scData.ms = "Title";
    saveData();
}
world.getDimension('overworld').runCommand("scoreboard objectives add cd_col dummy");
world.getDimension("overworld").runCommand("scoreboard objectives add coling dummy");

world.beforeEvents.playerInteractWithEntity.subscribe(event => {
    let target = event.target;
    let player = event.player;

    if (target.typeId === "b:scrap" && !target.hasTag('collecting')) {
        event.cancel = true;
        system.run(() => {
            player.runCommand("inputpermission set @s movement disabled");
            target.runCommand("tag @s add collecting");
            target.runCommand(`tag @s add ${player.name}col`);
            target.runCommand(`tp ${player.name} @s`);
            target.runCommand(`tp ${player.name} ^^^-1`);
            target.runCommand("scoreboard players set @s cd_col 30");
            target.runCommand(`tag @s remove ${player.name}col`);
            player.runCommand("scoreboard players set @s coling 10");
        });
    } else if (target.typeId === "b:scrap" && target.hasTag("collecting")) {
        player.sendMessage("§cมีคนเก็บไปแล้ว");
        system.run(() => {
            player.runCommand("playsound random.break");
        });
    }
});

system.runInterval(() => {
    let entities = world.getDimension("overworld").getEntities().filter(entity => entity.typeId === 'b:scrap');
    entities.forEach(entity => {
        let cooldown = getScore("cd_col", entity, true);
        if (cooldown > 0) {
            entity.runCommand("scoreboard players remove @s cd_col 1");
            entity.nameTag = "Cooldown: " + (cooldown - 1);
        }
        if (cooldown === 0) {
            entity.nameTag = 'พร้อมเก็บ';
            entity.runCommand("tag @s remove collecting");
        }
        entity.runCommand("effect @s resistance 99999 255 true");
    });
}, 20);

system.runInterval(() => {
    let players = world.getAllPlayers();
    players.forEach(player => {
        let colingScore = getScore("coling", player, true);
        let progress = Math.floor(colingScore / 10 * 9);
        let progressBar = '§c' + '✦'.repeat(10 - progress) + '§7' + '✦'.repeat(progress) + "\n§aกำลังเก็บ";

        if (colingScore > 0) {
            player.runCommand("scoreboard players remove @s coling 1");
            player.runCommand(`title @s ${scData.ms} ${progressBar}`);
            player.runCommand("playanimation @s animation.react_confirm_2 a 1000");
            player.runCommand("playsound random.pop2 @s ~~~15");
        }
        if (colingScore === 1) {
            player.runCommand("inputpermission set @s movement enabled");
            player.runCommand(`titleraw @s ${scData.ms} {"rawtext":[{"text":"§c✦✦✦✦✦✦✦✦✦✦\n§aเก็บสำเร็จ"}]}`);
            player.runCommand("playsound random.orb @s ~~~10");
            player.runCommand("give @s b:scraps");
        }
    });
}, 10);
//by Aitji Gamer
function getScore(objectiveName, entity, defaultValue = true) {
    try {
        const objective = world.scoreboard.getObjective(objectiveName);
        if (typeof entity == "string") {
            return objective.getScore(objective.getParticipants().find(participant => participant.displayName == entity)) ?? (defaultValue ? 0 : null);
        }
        return objective.getScore(entity.scoreboardIdentity) ?? (defaultValue ? 0 : null);
    } catch {
        return defaultValue ? 0 : null;
    }
}

world.beforeEvents.itemUse.subscribe(event => {
    let item = event.itemStack;
    if (item.typeId === "minecraft:gold_nugget") {
        config(event.source);
    }
});

function config(player) {
    system.run(() => {
        let options = ["Title", 'Actionbar'];
        new ModalFormData()
            .title("Scrap Addon")
            .dropdown("§eCreator: Bamip1\n§9Discord: @bigc8888\n§cYoutube: Bigc Genuis\n§bเลือกแสดงข้อความ", options)
            .show(player)
            .then(response => {
                if (response.canceled) {
                    return;
                }
                let selectedOption = options[response.formValues[0]];
                scData = { 'ms': selectedOption };
                saveData();
                player.sendMessage('§aบันทึกข้อมูลสำเร็จ');
                player.runCommand("playsound random.orb");
            });
    });
}