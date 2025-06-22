import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

class MedicSystem {
    data = {
        sel: "title",
        retime: 300,
        cos: "15 66 30",
        mo: 500
    };
    constructor() {
        this.load();
        system.run(() => {
            const dim = world.getDimension("overworld");
            dim.runCommand("scoreboard objectives add wait dummy");
            dim.runCommand("gamerule doimmediaterespawn true");
        });
        this.registerEvents();
    }
    save() {
        system.run(() => world.setDynamicProperty("medicData", JSON.stringify(this.data)));
    }
    load() {
        system.run(() => {
            let d = world.getDynamicProperty("medicData");
            if (d) this.data = JSON.parse(d);
        });
    }
    getScore(obj, ent) {
        try {
            let o = world.scoreboard.getObjective(obj);
            return o.getScore(ent.scoreboardIdentity) ?? 0;
        } catch { return 0; }
    }
    teleport(entity) {
        system.runTimeout(() => entity.runCommand("tp @s " + this.data.cos), 20);
    }
    showAdminForm(player, cb) {
        let types = ['เลือกจำพวกข้อความ', "title", "actionbar"];
        new ModalFormData()
            .title("§5Medic Addon")
            .dropdown("§eCreator: §aBamip1\n§gเลือกจำพวกข้อความ", types)
            .textField("§gกำหนดเวลาตอนตายแล้วจะเกิดเอง", "เช่น: 300")
            .textField("§gพิกัดโรงพยาบาลตอนตาย", "เช่น 1 -60 1")
            .textField("§gเงินที่หมอได้รับ และผู้ตายจะเสีย เวลาชุบ", "เช่น: 500")
            .show(player)
            .then(r => {
                if (!r.canceled) {
                    let [sel, retime, cos, mo] = [types[r.formValues[0]], ...r.formValues.slice(1)];
                    Object.assign(this.data, { sel, retime, cos, mo });
                    this.save();
                    player.sendMessage(`§cเวลารอเกิด: §a${retime}\n§cพิกัดโรงพยาบาล: §a${cos}\n§cเงิน: §a${mo}`);
                    player.runCommand("playsound random.orb");
                    cb && cb();
                }
            });
    }
    showCPRForm(player, cb) {
        system.runTimeout(() => {
            let form = new ActionFormData().title("§5Medic Addon").body("กรุณาเลือกคนที่ต้องการชุบ");
            let icons = ["icon_alex", "icon_steve"];
            let playerLoc = player.location;
            let deads = world.getAllPlayers().filter(p => 
                p.hasTag('d') &&
                Math.sqrt(
                    Math.pow(p.location.x - playerLoc.x, 2) +
                    Math.pow(p.location.y - playerLoc.y, 2) +
                    Math.pow(p.location.z - playerLoc.z, 2)
                ) <= 5
            );
            if (deads.length)
                deads.forEach(p => form.button(p.name, 'textures/ui/' + icons[Math.floor(Math.random() * icons.length)]));
            else
                form.button("§cไม่มีคนตายใกล้คุณ", 'textures/ui/redX1');
            form.show(player).then(res => {
                if (res.selection !== undefined && deads.length) cb && cb(player, deads[res.selection]);
            });
        }, 20);
    }
    registerEvents() {
        world.afterEvents.entityDie.subscribe(e => {
            let ent = e.deadEntity;
            let medics = world.getAllPlayers().filter(p => p.hasTag("medic"));
            if (!ent.hasTag('d') && !ent.hasTag("medic")) {
            ent.runCommand(`scoreboard players set @s wait ${this.data.retime}`);
            if (!medics.length) ent.runCommand("scoreboard players set @a[tag=d] wait 30");
            system.runTimeout(() => {
                ent.addTag('d');
            }, 1)
            this.teleport(ent);
            }
        });
        world.afterEvents.itemUse.subscribe(e => {
            if (e.itemStack.typeId === "minecraft:feather") {
                if (e.source.hasTag("Admin")) this.showAdminForm(e.source);
            }
        });
        world.beforeEvents.chatSend.subscribe(e => {
            if (e.message === "cpr") {
                e.cancel = true;
                this.showCPRForm(e.sender, (medic, target) => {
                    medic.runCommand(`scoreboard players add @s money ${this.data.mo}`);
                    target.runCommand(`scoreboard players remove @s money ${this.data.mo}`);
                    medic.sendMessage(`§a+${this.data.mo}$ คุณได้ชุบ §c${target.name}`);
                    target.sendMessage(`§c-${this.data.mo}$ คุณได้ถูกชุบจากหมอ §a${medic.name}`);
                    target.removeTag('d'); target.removeTag('de');
                    medic.runCommand("playsound random.orb");
                    target.runCommand("playsound random.orb");
                    target.runCommand("inputpermission set @s movement enabled");
                });
            }
        });
        system.runInterval(() => {
            world.getAllPlayers().forEach(p => {
                if (p.hasTag('d')) {
                    p.sendMessage("§cคุณได้ตายต้องรอหมอมาชุบ");
                    p.runCommand('tellraw @a[tag=medic] {"rawtext":[{"text":"§dมีคนต้องการความช่วยเหลือที่โรงพยาบาล"}]}');
                }
            });
        }, 120);
        system.runInterval(() => {
            let players = world.getAllPlayers(), medics = players.filter(p => p.hasTag("medic"));
            players.forEach(p => {
                let wait = this.getScore("wait", p);
                if (p.hasTag('d')) {
                    p.runCommand("scoreboard players remove @s wait 1");
                    p.runCommand(`title @s ${this.data.sel} §cกำลังรอเกิดใน§f: §b${wait - 1}`);
                }
            });
        }, 20);
        system.runInterval(() => {
            let players = world.getAllPlayers(), medics = players.filter(p => p.hasTag("medic"));
            players.forEach(p => {
                if (!world.scoreboard.getObjective('wait')) return world.scoreboard.addObjective('wait');
                let wait = this.getScore('wait', p);
                if (p.hasTag("medic")) {
                    p.runCommand("tag @a[r=5,tag=d,tag=!medic] add de");
                    p.runCommand("tag @a[rm=5,tag=d,tag=!medic] remove de");
                }
                if (p.hasTag('d')) {
                    p.runCommand("inputpermission set @s movement disabled");
                    p.runCommand("effect @s instant_health 2 255 true");
                }
                if (wait === 0 && p.hasTag('d')) {
                    p.runCommand("tag @s remove d");
                    p.runCommand("tag @s remove de");
                    p.runCommand(`scoreboard players remove @s money ${this.data.mo}`);
                    p.sendMessage(`§c-${this.data.mo}$ คุณได้เกิดอัตโนมัติ`);
                    p.runCommand("inputpermission set @s movement enabled");
                }
            });
        });
    }
}

new MedicSystem();
