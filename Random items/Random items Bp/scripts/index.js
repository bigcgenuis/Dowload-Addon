import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { world, system, PlayerSpawnAfterEvent } from "@minecraft/server";
world.beforeEvents.itemUse.subscribe(e => {
    let i = e.itemStack;
    if (i.typeId === `b:random`) {
        cch(e.source);
        e.source.runCommand(`clear @s b:random 0 1`)
    } else if (i.typeId === `minecraft:brick`) {
        main(e.source);
    }
});
function main(p) {
    system.run(() => {
        let box = world.getDynamicProperty("ccs");
        let boxarea1 = world.getDynamicProperty("pos1");
        let boxarea2 = world.getDynamicProperty("pos2");
        if (p.hasTag(`Admin`)) {
            new ActionFormData()
            .title(`§cConfig addon random items`)
            .body(`§cพิกัดกล่องปัจจุบัน: §a${box}\n§cพิกัดสุ่มกล่อง: §a${boxarea1},${boxarea2}`)
            .button(`กำหนดพิกัดกล่อง`, `textures/ui/promo_gift_small_green`)
            .button(`กำหนดพิกัดสุ่มกล่อง`, `textures/ui/promo_gift_small_blue`)
            .show(p).then(rr => {
                let r = rr.selection;
                if (r == 0) configc(p);
                if (r == 1) configpos(p);
            });
        } else {
            p.sendMessage(`§cคุณไม่ใช่แอดมิน`);
            p.runCommand(`playsound random.break`);
        }
    });
}
function configc(p) {
    new ModalFormData()
    .title(`§cกำหนดพิกัดกล่อง`)
    .textField(`พิกัดที่ 1 (ใส่เป็นเลขเท่านั้น X Y Z)`, `ตัวอย่าง 11 -60 11`)
    .textField(`พิกัดที่ 2 (ใส่เป็นเลขเท่านั้น X Y Z)`, `ตัวอย่าง 12 -60 11`)
    .show(p).then(r => {
        if (r.canceled) return;
        let c1 = r.formValues[0].trim();
        let c2 = r.formValues[1].trim();
        if (!c1 || !c2) {
            p.sendMessage(`§cกรุณากรอกพิกัดให้ครบทั้ง 2 พิกัด`);
            p.runCommand(`playsound random.break`);
            return;
        }
        let crs1 = c1.split(" ");
        let crs2 = c2.split(" ");
        if (crs1.length !== 3 || crs2.length !== 3) {
            p.sendMessage(`§cกรุณากรอกพิกัดในรูปแบบ "X Y Z" ให้ครบทั้ง 3 ตำแหน่ง`);
            p.runCommand(`playsound random.break`);
            return;
        }
        for (let cr of crs1.concat(crs2)) {
            if (isNaN(cr)) {
                p.sendMessage(`§cกรุณากรอกพิกัดเป็นตัวเลขเท่านั้น`);
                p.runCommand(`playsound random.break`);
                return;
            }
        }
        let cs = `${c1},${c2}`;
        world.setDynamicProperty("ccs", cs);
        p.sendMessage(`§aพิกัดถูกบันทึก: ${cs}`);
        p.runCommand(`playsound random.orb`);
    });
}
function cch(player) {
    system.run(() => {
        let box = world.getDynamicProperty("ccs");
        if (!box) {
            player.sendMessage(`§cยังไม่มีการตั้งค่าพิกัดกล่อง`);
            player.runCommand(`playsound random.break`);
            return;
        }
        let csar = box.split(",");
        if (csar.length !== 2) {
            player.sendMessage(`§cข้อมูลพิกัดไม่ถูกต้อง`);
            player.runCommand(`playsound random.break`);
            return;
        }
        let c1 = csar[0].trim().split(" ");
        let c2 = csar[1].trim().split(" ");
        let x1 = parseInt(c1[0]);
        let y1 = parseInt(c1[1]);
        let z1 = parseInt(c1[2]);
        let x2 = parseInt(c2[0]);
        let y2 = parseInt(c2[1]);
        let z2 = parseInt(c2[2]);
        rpoos(player)
        player.runCommand(`execute @e[name=${player.name}randomItems] ~~~ clone ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ~~~`)
        player.runCommand(`execute @e[name=${player.name}randomItems] ~~~ fill ~1 ${y1} ~-1 ~-1 ${y2} ~1 air destroy`)
        player.runCommand(`execute @e[name=${player.name}randomItems] ~~~ tp @r[type=item,name=!chest] ${player.name}`)
        player.runCommand(`execute @e[name=${player.name}randomItems] ~~~ kill @e[type=item,r=4]`)
        player.runCommand(`execute @e[name=${player.name}randomItems] ~~~ kill @s`)
        player.sendMessage(`§aสุ่มของเรียบร้อย`)
    });
}
function rpos(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rpoos(p) {
    const pos1 = world.getDynamicProperty("pos1").split(' ').map(Number);
    const pos2 = world.getDynamicProperty("pos2").split(' ').map(Number);
    if (pos1.length === 3 && pos2.length === 3) {
        const rx = rpos(Math.min(pos1[0], pos2[0]), Math.max(pos1[0], pos2[0]));
        const ry = rpos(Math.min(pos1[1], pos2[1]), Math.max(pos1[1], pos2[1]));
        const rz = rpos(Math.min(pos1[2], pos2[2]), Math.max(pos1[2], pos2[2]));
        const posch = `${rx} ${ry} ${rz}`;
        p.runCommand(`summon armor_stand ${p.name}randomItems ${posch}`);
        p.runCommand(`playsound random.orb`);
    } else {
        p.sendMessage("§cไม่สามารถดึงพิกัดที่ถูกบันทึกได้");
        p.runCommand(`playsound random.break`);
    }
}
function configpos(p) {
    new ModalFormData()
    .title(`§cกำหนดพิกัดสุ่มล่อง`)
    .textField(`พิกัดที่ 1 (ใส่เป็นเลขเท่านั้น X Y Z)`, `ตัวอย่าง 11 -60 11`)
    .textField(`พิกัดที่ 2 (ใส่เป็นเลขเท่านั้น X Y Z)`, `ตัวอย่าง 12 -60 11`)
    .show(p).then(r => {
        let pos1 = r.formValues[0].split(' ').map(Number);
        let pos2 = r.formValues[1].split(' ').map(Number);
        if (pos1.length === 3 && pos2.length === 3) {
            world.setDynamicProperty("pos1", pos1.join(" "));
            world.setDynamicProperty("pos2", pos2.join(" "));
            p.sendMessage(`§aพิกัดถูกบันทึกเรียบร้อย: ${pos1.join(" ")} และ ${pos2.join(" ")}`);
            p.runCommand(`playsound random.orb`);
        } else {
            p.sendMessage("§cกรอกพิกัดไม่ถูกต้อง");
            p.runCommand(`playsound random.break`);
        }
    });
}
