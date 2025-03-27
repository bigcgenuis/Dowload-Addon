import { world, system } from "@minecraft/server";
world.getDimension(`overworld`).runCommand(`scoreboard objectives add coolDown dummy`);
world.getDimension(`overworld`).runCommand(`scoreboard objectives add cd dummy`);
world.getDimension(`overworld`).runCommand(`scoreboard objectives add cd_leg dummy`);
world.getDimension(`overworld`).runCommand(`scoreboard objectives add coolDown_db dummy`);
world.getDimension(`overworld`).runCommand(`scoreboard objectives add cd_db dummy`);
world.getDimension(`overworld`).runCommand(`scoreboard objectives add cd_leg_db dummy`);
world.getDimension(`overworld`).runCommand(`scoreboard objectives add toggle_db dummy`);
function getScore(objective, target, useZero = true) {
    try {
        const obj = world.scoreboard.getObjective(objective);
        if (typeof target == 'string') {
            return obj.getScore(obj.getParticipants().find(v => v.displayName == target)) ?? 0;
        }
        return obj.getScore(target.scoreboardIdentity) ?? 0;
    } catch {
        return 0;
    }
}
let ev = world.beforeEvents.itemUse;
world.afterEvents.entityHitEntity.subscribe(e => {
    let x = Math.floor(e.hitEntity.location.x);
    let y = Math.floor(e.hitEntity.location.y);
    let z = Math.floor(e.hitEntity.location.z);
    if (e.hitEntity.typeId === `b:poon` && e.hitEntity.hasTag(`Start`)) {
        e.hitEntity.runCommand(`setblock ~~-1~ air destroy`);
        e.hitEntity.runCommand(`kill @e[type=b:poon]`);
        e.hitEntity.runCommand(`kill @e[type=item,name=bedrock]`);
        e.damagingEntity.runCommand(`tag @s remove Start`);
    }
    if (e.hitEntity.typeId === `b:poon` && !e.hitEntity.hasTag(`Start`) && !e.hitEntity.hasTag(`cd`) && !e.damagingEntity.hasTag(`police`)) {
        jogpoon(e.damagingEntity, e.hitEntity, x, y, z);
    }
    if (e.hitEntity.typeId === `b:poon` && e.damagingEntity.hasTag(`police`) && !e.hitEntity.hasTag(`cd`)) {
        e.damagingEntity.sendMessage(`§cตำรวจห้ามจกปูน`);
        e.damagingEntity.runCommandAsync(`playsound random.break`);
        e.hitEntity.runCommand(`kill @s`);
        e.hitEntity.runCommand(`summon b:poon ${x} ${y} ${z}`);
    }
    if (e.hitEntity.typeId === `b:poon` && e.hitEntity.hasTag(`cd`)) {
        e.hitEntity.runCommand(`tp @s ${x} ${y} ${z}`)
    }
});
function jogpoon(p, e, x, y, z) {
    let enn = world.getDimension(`overworld`).getEntities().filter(enn => enn.typeId === `b:poon` && enn.hasTag(`Start`));
    enn.map(ars => {
        let cdspawn = getScore(`coolDown_db`, ars);
        let cd = getScore(`cd_db`, ars);
        let cd_leg = getScore(`cd_leg_db`, ars);
        e.runCommand(`summon b:poon Cooldown ~~~`)
        p.runCommand(`tag @e[name=Cooldown,r=5] add cd`)
        p.runCommand(`scoreboard players set @e[name=Cooldown,r=5] coolDown ${cdspawn}`)
        e.runCommand(`tp @s ~~1000~`);
        kill(e);
        p.runCommandAsync(`scoreboard players set @s cd ${cd}`);
        p.runCommandAsync(`scoreboard players set @s cd_leg ${cd_leg}`);
        p.runCommandAsync(`tag @s add b`)
        p.runCommandAsync(`give @s b:po`)
        p.sendMessage(`§bกำลังจกปูน`)
        p.runCommand(`inputpermission set @s movement disabled`);
        p.runCommandAsync(`tellraw @a[tag=police] {"rawtext":[{"text":"§e[191] §cปูนถูกจกไปแล้วที่พิกัด§a ${x}, ${y}, ${z}"}]}`);
    })
}
function kill(e) {
    system.runTimeout(() => {
        e.runCommand(`kill @s`);
    }, 20);
}
ev.subscribe(ev => {
    if (!ev.source.isSneaking) {
        let { itemStack } = ev;
        switch (itemStack.typeId) {
            case `minecraft:dragon_breath`:
                config(ev.source);
                ev.cancel = true;
                break;
                case `minecraft:shulker_shell`:
                    main(ev.source);
                    ev.cancel = true;
                    break;
        }
    }
});
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
function main(p) {
    system.run(() => {
        new ActionFormData()
        .title(`Reset`)
        .button(`รีเซ็ต ทุกอย่าง`)
        .button(`รีเซ็ตปูนรอบๆตัว 5 บล็อก`)
        .show(p).then(r => {
            if (r.selection === 0) {
                p.runCommand(`execute @e[type=b:poon] ~~~ setblock ~~-1~ air destroy`)
                p.runCommand(`kill @e[type=item,name=bedrock]`);
                p.runCommand(`kill @e[type=b:poon]`)
                p.sendMessage(`§aรีเซ็ตสำเร็จ`)
                p.runCommand(`playsound random.orb`)
                p.runCommand(`tag @s remove Start`)
            }
            if (r.selection === 1) {
                p.runCommand(`kill @e[r=5,type=b:poon,tag=!Start]`)
                p.sendMessage(`§aรีเซ็ตสำเร็จ`)
                p.runCommand(`playsound random.orb`)
            }
        })
    })
}
function config(p) {
    let enn = world.getDimension(`overworld`).getEntities().filter(enn => enn.typeId === `b:poon` && enn.hasTag(`Start`));
    if (!p.hasTag(`Start`) && p.hasTag(`Admin`)) {
        system.run(() => {
            new ActionFormData()
                .title(`§aเริ่มต้นใช้งาน`)
                .button(`กดตรงนี้เพื่อเริ่มต้น`)
                .show(p).then(re => {
                    let r = re.selection;
                    if (r == 0) {
                        let x = Math.floor(p.location.x);
                        let y = Math.floor(p.location.y);
                        let z = Math.floor(p.location.z);
                        p.runCommand(`kill @e[type=b:poon]`)
                        p.runCommandAsync(`setblock ~~-1~ bedrock`);
                        p.runCommand(`summon b:poon Start ${x} ${y} ${z}`);
                        p.runCommand(`tag @e[type=b:poon,r=5] add Start`);
                        p.runCommand(`tag @s add Start`);
                        p.runCommand(`scoreboard players set @e[tag=Start,tag=!Admin] coolDown_db 1200`);
                        p.runCommand(`scoreboard players set @e[tag=Start,tag=!Admin] cd_db 600`);
                        p.runCommand(`scoreboard players set @e[tag=Start,tag=!Admin] cd_leg_db 60`);
                    }
                });
        });
    }
    if (p.hasTag(`Admin`) && p.hasTag(`Start`)) {
        enn.map(ars => {
            let cdspawn = getScore(`coolDown_db`, ars);
            let cd = getScore(`cd_db`, ars);
            let cd_leg = getScore(`cd_leg_db`, ars);
            config1(p, cdspawn, cd, cd_leg, ars);
        });
    } else if (p.hasTag(`Admin`) && !p.hasTag(`Start`)) return;
    else {
        p.sendMessage(`§cคุณไม่ใช่แอดมิน`);
    }
}
function config1(p, cds, cd, cdl, e) {
    system.run(() => {
        let cto = getScore("toggle_db", e);
        new ModalFormData()
            .title(`§cกำหนดค่า แอดออนจกปูน`)
            .toggle(`§eแสดงเวลาคดีบน §cActionbar`, cto === 1)
            .textField(`§eกำหนดเวลาคดี §c> §aใส่เป็นวินาที\n§dเวลาคดีปัจจุบัน§b:§7 ${cd}`, `§sใส่เลข`, `${cd}`)
            .textField(`§eกำหนดเวลาปูนเกิด §c> §aใส่เป็นวินาที\n§dเวลาปูนเกิดปัจจุบัน§b:§7 ${cds}`, `§sใส่เลข`, `${cds}`)
            .textField(`§eกำหนดเวลาล็อคขา §c> §aใส่เป็นวินาที\n§dเวลาล็อคขาปัจจุบัน§b: §7${cdl}`, `§sใส่เลข`, `${cdl}`)
            .show(p).then(r => {
                if (r.canceled) return;
                let f0 = r.formValues[0];
                let f1 = r.formValues[1];
                let f2 = r.formValues[2];
                let f3 = r.formValues[3];
                if (!f1 || !f2 || !f3) {
                    p.sendMessage(`§cกรุณากรอกข้อมูลให้ครบ`);
                    p.runCommandAsync(`playsound random.break`);
                    return;
                }
                f1 = Number(f1);
                f2 = Number(f2);
                f3 = Number(f3);
                if (isNaN(f1) || isNaN(f2) || isNaN(f3)) {
                    p.sendMessage(`§cกรุณาใส่เลขเท่านั้น`);
                    p.runCommandAsync(`playsound random.break`);
                    return;
                }
                if (f1 <= 0 || f2 <= 0 || f3 <= 0) {
                    p.sendMessage(`§cกรุณาใส่เลขที่มากกว่า 0`);
                    p.runCommandAsync(`playsound random.break`);
                    return;
                }
                e.runCommandAsync(`scoreboard players set @s cd_db ${f1}`);
                e.runCommandAsync(`scoreboard players set @s coolDown_db ${f2}`);
                e.runCommandAsync(`scoreboard players set @s cd_leg_db ${f3}`);
                e.runCommandAsync(`scoreboard players set @s toggle_db ${f0 ? 1 : 0}`);
                p.sendMessage(`§aบันทึกข้อมูลสำเร็จ`);
                p.runCommandAsync(`playsound random.orb`);
            });
    });
}
system.runInterval(() => {
    let enn = world.getDimension(`overworld`).getEntities().filter(enn => enn.typeId === `b:poon` && enn.hasTag(`Start`));
    enn.map(e => {
        world.getAllPlayers().forEach(p => {
            let cd = getScore(`cd`, p);
            let c = getScore(`cd_leg`, p);
            let t = getScore(`toggle_db`, e);
            if (t === 1) {
                p.runCommand(`title @a actionbar §cเวลาคดี§r: ${cd}`);
            }
            if (cd > 0) {
                p.runCommand(`scoreboard players remove @s cd 1`);
            }
            if (cd === 1) {
                p.sendMessage(`§eเวลาคดีของคุณหมดแล้ว`);
                p.removeTag(`b`);
            }
            if (c > 0) {
                p.runCommand(`inputpermission set @s movement disabled`);
                p.runCommand(`scoreboard players remove @s cd_leg 1`);
            }
            if (c === 1) {
                p.runCommand(`inputpermission set @s movement enabled`);
            }
            p.runCommand(`effect @e[type=b:poon] regeneration 99999 255 true`)
        })
    })
    let ent = world.getDimension(`overworld`).getEntities().filter(enn => enn.typeId === `b:poon` && enn.hasTag(`cd`));
    ent.map(e => {
        let c = getScore(`coolDown`, e);
        if (c > 0) {
            e.nameTag = `Cooldown: ${c-1}`
            e.runCommand(`scoreboard players remove @s coolDown 1`)
        }
        if (c === 1) {
            e.runCommand(`summon b:poon`)
            e.runCommand(`kill @s`)
        }
    })
}, 20)