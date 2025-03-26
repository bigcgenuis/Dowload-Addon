import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

world.beforeEvents.itemUse.subscribe(event => {
    let itemStack = event.itemStack;
    if (itemStack.typeId === "minecraft:magma_cream") {
        transferMoney(event.source);
    }
});

function transferMoney(player) {
    system.run(() => {
        let form = new ActionFormData()
            .title("§dTransfer Money Addon")
            .body("§bกรุณาเลือกผู้เล่นที่จะโอนเงินให้");

        let nearbyPlayers = world.getAllPlayers().filter(p => p.hasTag(player.name + 'Pl'));
        if (nearbyPlayers.length > 0) {
            nearbyPlayers.forEach(nearbyPlayer => {
                form.button('§2' + nearbyPlayer.name + "\n§cClick", "textures/ui/icon_steve");
            });
        } else {
            form.button("§c§lไม่มีผู้เล่นอยู่ใกล้คุณ", "textures/ui/redX1");
        }

        form.show(player).then(response => {
            if (response.canceled) {
                return;
            }
            if (nearbyPlayers.length > 0 && response.selection < nearbyPlayers.length) {
                let selectedPlayer = nearbyPlayers[response.selection];
                showTransferForm(player, selectedPlayer);
            }
        });
    });
}

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        player.runCommand("tag @s add " + player.name + 'Tran');
        if (player.hasTag(player.name + 'Tran')) {
            player.runCommand("tag @a[r=5,tag=!" + player.name + "Tran] add " + player.name + 'Pl');
            player.runCommand("tag @a[rm=5] remove " + player.name + 'Pl');
        }
    });
});

function showTransferForm(sender, receiver) {
    let money = getScore('money', sender, true);
    let redMoney = getScore("redmoney", sender, true);
    let moneyTypes = ["money", 'redmoney'];

    new ModalFormData()
        .title("§dTransfer Money Addon")
        .textField("§bกรุณาใส่จำนวนที่จะโอนให้ §a" + receiver.name, "เงินที่คุณมี " + money)
        .dropdown("คุณต้องการให้เงินอะไร", moneyTypes)
        .show(sender)
        .then(response => {
            if (response.canceled) {
                return;
            }
            let amount = parseInt(response.formValues[0]);
            let selectedMoneyType = moneyTypes[response.formValues[1]];

            if (isNaN(amount) || amount <= 0) {
                sender.sendMessage("§cกรุณากรอกจำนวนเงินที่ถูกต้อง");
                sender.runCommand("playsound random.break");
                return;
            }

            let currentMoney = selectedMoneyType === "money" ? money : redMoney;
            if (amount > currentMoney) {
                sender.sendMessage("§cคุณมี " + selectedMoneyType + " ไม่พอ §d" + amount + '$');
                sender.runCommand("playsound random.break");
                return;
            }

            sender.runCommand("scoreboard players add " + receiver.name + " " + selectedMoneyType + " " + amount);
            sender.runCommand("scoreboard players remove @s " + selectedMoneyType + " " + amount);
            sender.sendMessage("§aคุณได้โอนเงิน จำนวน §b" + amount + "$ §aให้กับ §c" + receiver.name + " โดยใช้ " + selectedMoneyType);
            sender.runCommand("playsound random.orb");
            receiver.sendMessage("§aคุณได้รับเงินจำนวน §b" + amount + "$ §aจาก §c" + sender.name);
            receiver.runCommand("playsound random.orb");
        });
}
//by Aitji Gamer
function getScore(objectiveName, player, defaultValue = true) {
    try {
        const objective = world.scoreboard.getObjective(objectiveName);
        if (typeof player == "string") {
            return objective.getScore(objective.getParticipants().find(participant => participant.displayName == player)) ?? (defaultValue ? 0 : null);
        }
        return objective.getScore(player.scoreboardIdentity) ?? (defaultValue ? 0 : null);
    } catch {
        return defaultValue ? 0 : null;
    }
}