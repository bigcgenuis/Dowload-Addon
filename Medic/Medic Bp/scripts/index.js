import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

let medicData = {};

function saveData() {
    system.run(() => {
        world.setDynamicProperty("medicData", JSON.stringify(medicData));
    })
}

function loadData() {
    system.run(() => {
        let data = world.getDynamicProperty("medicData");
        if (data) {
            medicData = JSON.parse(data);
        }
    });
}

loadData();
system.run(() => {
    world.getDimension("overworld").runCommand("scoreboard objectives add wait dummy");
    world.getDimension("overworld").runCommand("gamerule doimmediaterespawn true");
})


world.afterEvents.entityDie.subscribe(event => {
    if (!event.deadEntity.hasTag('d') && !event.deadEntity.hasTag("medic")) {
        event.deadEntity.addTag('d');
        event.deadEntity.runCommand("scoreboard players set @s wait " + medicData.retime);
        teleport(event.deadEntity);
    }
});

world.beforeEvents.itemUse.subscribe(event => {
    let item = event.itemStack;
    if (item.typeId === "minecraft:feather") {
        main(event.source);
    }
});

function teleport(entity) {
    system.runTimeout(() => {
        entity.runCommand("tp @s " + medicData.cos);
    }, 20);
}

function main(player) {
    system.run(() => {
        if (player.hasTag("Admin")) {
            let messageTypes = ['เลือกจำพวกข้อความ', "title", "actionbar"];
            new ModalFormData()
                .title("§5Medic Addon")
                .dropdown("§eCreator: §aBamip1\n§gเลือกจำพวกข้อความ", messageTypes)
                .textField("§gกำหนดเวลาตอนตายแล้วจะเกิดเอง", "เช่น: 300")
                .textField("§gพิกัดโรงพยาบาลตอนตาย", "เช่น 1 -60 1")
                .textField("§gเงินที่หมอได้รับ และผู้ตายจะเสีย เวลาชุบ", "เช่น: 500")
                .show(player)
                .then(response => {
                    if (!response.canceled) {
                        let selectedMessageType = messageTypes[response.formValues[0]];
                        let respawnTime = response.formValues[1];
                        let hospitalCoordinates = response.formValues[2];
                        let money = response.formValues[3];
                        medicData.sel = selectedMessageType;
                        medicData.retime = respawnTime;
                        medicData.cos = hospitalCoordinates;
                        medicData.mo = money;
                        saveData();
                        player.sendMessage("§cเวลารอเกิด: §a" + respawnTime + "\n§cพิกัดโรงพยาบาล: §a" + hospitalCoordinates + "\n§cเงิน: §a" + money);
                        player.runCommand("playsound random.orb");
                    }
                });
        }
    });
}

world.beforeEvents.chatSend.subscribe(event => {
    if (event.message === "cpr") {
        event.cancel = true;
        cpr(event.sender);
    }
});

function cpr(player) {
    system.runTimeout(() => {
        let form = new ActionFormData();
        form.title("§5Medic Addon");
        form.body("กรุณาเลือกคนที่ต้องการชุบ");
        let icons = ["icon_alex", "icon_steve"];
        let randomIcon = icons[Math.floor(Math.random() * icons.length)];
        let deadPlayers = world.getAllPlayers().filter(p => p.hasTag('de'));
        if (deadPlayers.length > 0) {
            deadPlayers.forEach(deadPlayer => {
                form.button(deadPlayer.name, 'textures/ui/' + randomIcon);
            });
        } else {
            form.button("§cไม่มีคนตายใกล้คุณ", 'textures/ui/redX1');
        }
        form.show(player).then(response => {
            if (response.selection !== undefined && deadPlayers.length > 0) {
                let selectedPlayer = deadPlayers[response.selection];
                player.runCommand("scoreboard players add @s money " + medicData.mo);
                selectedPlayer.runCommand("scoreboard players remove @s money " + medicData.mo);
                player.sendMessage('§a+' + medicData.mo + "$ คุณได้ชุบ §c" + selectedPlayer.name);
                selectedPlayer.sendMessage("§c-" + medicData.mo + "$ คุณได้ถูกชุบจากหมอ §a" + player.name);
                selectedPlayer.removeTag('d');
                selectedPlayer.removeTag('de');
                player.runCommand("playsound random.orb");
                selectedPlayer.runCommand("playsound random.orb");
                selectedPlayer.runCommand("inputpermission set @s movement enabled");
            }
        });
    }, 20);
}

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        if (player.hasTag('d')) {
            player.sendMessage("§cคุณได้ตายต้องรอหมอมาชุบ");
            player.runCommand("tellraw @a[tag=medic] {\"rawtext\":[{\"text\":\"§dมีคนต้องการความช่วยเหลือที่โรงพยาบาล\"}]}");
        }
    });
}, 120);

system.runInterval(() => {
    let players = world.getAllPlayers();
    let medics = players.filter(player => player.hasTag("medic"));
    players.forEach(player => {
        let waitScore = getScore("wait", player, true);
        if (medics.length > 0 && player.hasTag('d')) {
            player.runCommand("scoreboard players remove @s wait 1");
            player.runCommand("title @s " + medicData.sel + " §cกำลังรอเกิดใน§f: §b" + (waitScore - 1));
        }
    });
}, 20);

system.runInterval(() => {
    let players = world.getAllPlayers();
    let medics = players.filter(player => player.hasTag("medic"));
    players.forEach(player => {
        let waitScore = getScore('wait', player, true);
        if (player.hasTag("medic")) {
            player.runCommand("tag @a[r=5,tag=d,tag=!medic] add de");
            player.runCommand("tag @a[rm=5,tag=d,tag=!medic] remove de");
        }
        if (player.hasTag('d')) {
            player.runCommand("inputpermission set @s movement disabled");
            player.runCommand("effect @s instant_health 2 255 true");
        }
        if (medics.length < 1) {
            player.runCommand("scoreboard players set @a[tag=d] wait 0");
        }
        if (waitScore === 0 && player.hasTag('d')) {
            player.runCommand("tag @s remove d");
            player.runCommand("tag @s remove de");
            player.runCommand("scoreboard players remove @s money " + medicData.mo);
            player.sendMessage("§c-" + medicData.mo + "$ คุณได้เกิดอัตโนมัติ");
            player.runCommand("inputpermission set @s movement enabled");
        }
    });
});
//By Aitji Gamer
function getScore(objectiveName, entity, isPlayer = true) {
    try {
        let objective = world.scoreboard.getObjective(objectiveName);
        if (typeof entity == "string") {
            return objective.getScore(objective.getParticipants().find(participant => participant.displayName == entity)) ?? 0;
        }
        return objective.getScore(entity.scoreboardIdentity) ?? 0;
    } catch {
        return 0;
    }
}