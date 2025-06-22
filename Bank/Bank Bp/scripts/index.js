import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

class Bank {
    constructor() {
        this.data = {};
        this.load();
        world.beforeEvents.playerInteractWithEntity.subscribe(e => {
            if (e.target.hasTag('bank')) {
                e.cancel = true;
                system.run(() => this.menu(e.player));
            }
        });
        system.runInterval(() => this.interest(), 20);
    }

    save() {
        system.run(() => {
            world.setDynamicProperty('bankData', JSON.stringify(this.data));
        })
    }

    load() {
        system.run(() => {
            const d = world.getDynamicProperty('bankData');
            this.data = d ? JSON.parse(d) : {};
            if (!d) this.save();
        })
    }

    menu(player) {
        if (!world.scoreboard.getObjective("bank")) return world.scoreboard.addObjective("bank")
        new ActionFormData()
            .title('ธนาคาร').body('เลือกตัวเลือก:')
            .button('ฝากเงิน', 'textures/ui/jump_pressed')
            .button('ถอนเงิน', 'textures/ui/sneak_pressed')
            .button('ยอดเงิน', 'textures/ui/realms_slot_check')
            .show(player)
            .then(r => [this.deposit, this.withdraw, this.total][r.selection]?.call(this, player));
    }

    deposit(player) {
        this.input(player, 'ฝาก', (amount) => {
            if (this.score('money', player) < amount) return player.sendMessage('§cคุณไม่มีเงินพอ!');
            player.runCommand(`scoreboard players remove @s money ${amount}`);
            player.runCommand(`scoreboard players add @s bank ${amount}`);
            player.sendMessage(`§aฝากเงิน §c${amount}§a แล้ว!`);
        });
    }

    withdraw(player) {
        this.input(player, 'ถอน', (amount) => {
            if (this.score('bank', player) < amount) return player.sendMessage('§cคุณไม่มีเงินพอในบัญชีธนาคาร!');
            player.runCommand(`scoreboard players remove @s bank ${amount}`);
            player.runCommand(`scoreboard players add @s money ${amount}`);
            player.sendMessage(`§aถอนเงิน §c${amount}§a แล้ว!`);
        });
    }

    total(player) {
        player.sendMessage(`§aคุณมีเงิน §c${this.score('bank', player)}§a ในบัญชีธนาคาร!`);
    }

    input(player, type, cb) {
        new ModalFormData()
            .title('ธนาคาร')
            .label(`จำนวนเงินที่ต้องการ${type}:`)
            .textField('จำนวนเงิน', 'number')
            .show(player)
            .then(r => {
                const amount = parseInt(r.formValues[1]);
                if (isNaN(amount) || amount <= 0) return player.sendMessage('§cจำนวนเงินไม่ถูกต้อง!');
                cb(amount);
            });
    }

    score(obj, player) {
        try {
            const o = world.scoreboard.getObjective(obj);
            return o.getScore(player.scoreboardIdentity) ?? 0;
        } catch { return 0; }
    }

    interest() {
        world.getPlayers().forEach(player => {
            const score = this.score('bank', player);
            const cd = this.score('cd_bank', player);
            if (!this.data.pe || !this.data.se) return;
            if (cd > 0) player.runCommand(`scoreboard players remove @s cd_bank 1`);
            else {
                player.runCommand(`scoreboard players add @s bank ${Math.floor(score * this.data.pe / 100)}`);
                player.runCommand(`scoreboard players set @s cd_bank ${this.data.se}`);
            }
        });
    }
}

new Bank();
