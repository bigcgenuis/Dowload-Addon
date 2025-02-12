import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getVehicle, getVehicles, getVehiclesSpawned } from "../Function/MainFunctionVehicle";
import { saveData, loadData } from "../../database/oldDB";
import { scoreboard } from "../../minecraft/cmd"
import { world } from "@minecraft/server";

let vehicleData = loadData("vehicleData");

let Vehicle = {
    spawn_vehicle: (player) => {
        let vehicles = getVehicles(player);
        let form = new ActionFormData();
        form.title(`เบิกรถ`);
        form.body(`เลือกรถที่ต้องการเบิก`);
        vehicles.forEach(vehicle => form.button(vehicle.displayName));
        form.show(player).then(r => {
            if (r.canceled) return;
            let selectedCar = vehicles[r.selection];
            let spawnTag = `${selectedCar.tag}spawn`;
            player.runCommand(`summon ${selectedCar.id} ~ ~ ~`);
            player.runCommand(`tag @s add ${spawnTag}`);
            player.runCommand(`tag @s remove ${selectedCar.tag}`);
            player.runCommand(`tag @e[r=1,type=${selectedCar.id}] add ${player.name}spawn${selectedCar.tag}`);
        });
    },
    remove_vehicle: (player) => {
        let vehicles = getVehiclesSpawned(player);
        let vehicleInRange = vehicles.filter(vehicle => {
            let vehicleMob = world.getDimension("overworld").getEntities({
                type: vehicle.id,
                location: player.location,
                maxDistance: 5
            });
            return vehicleMob.length > 0;
        });
        if (vehicleInRange.length === 0) {
            player.sendMessage(`§cไม่มีรถ`)
            player.runCommand(`playsound note.bass`)
            return;
        }
        let form = new ActionFormData();
        form.title(`เก็บรถ`)
        form.body(`เลือกรถที่ต้องการเก็บ`);
        vehicleInRange.forEach(vehicle => form.button(vehicle.displayName));
        form.show(player).then(r => {
            if (r.canceled) return;
            let selectedCar = vehicleInRange[r.selection];
            if (player.hasTag(`${selectedCar.tag}spawn`)) {
                player.runCommand(`kill @e[type=${selectedCar.id},r=5]`);
                player.runCommand(`tag @s remove ${selectedCar.tag}spawn`)
                player.runCommand(`tag @s add ${selectedCar.tag}`)
            } else {
                player.sendMessage(`§cคุณไม่ใช่เจ้าของรถ`)
            }
        });
    },
    reset_vehicle: (player) => {
        let vehicles = getVehiclesSpawned(player);
        if (vehicles.length === 0) {
            player.sendMessage(`§cไม่มีรถ`)
            player.runCommand(`playsound note.bass`)
            return;
        }
        let form = new ActionFormData();
        form.title(`พาวรถ`);
        form.body(`เลือกรถที่ต้องการพาว`);
        vehicles.forEach(vehicle => form.button(vehicle.displayName));
        form.show(player).then(r => {
            if (r.canceled) return;
            let selectedCar = vehicles[r.selection];
            let spawnTag = `${selectedCar.tag}spawn`;
            if (scoreboard.getScore(player, "money") < 1000) {
                player.sendMessage(`§cเงินคุณไม่พอ 1000$`)
                player.runCommand(`playsound note.bass`);
                return;
            }
            player.runCommand(`tag @s remove ${spawnTag}`);
            player.runCommand(`tag @s add ${selectedCar.tag}`);
            player.sendMessage(`§c-1000$ §aพาวรถสำเร็จ`);
            player.runCommand(`kill @e[tag=${player.name}spawn${selectedCar.tag}]`);
            player.runCommand(`playsound random.orb`);
            player.runCommand(`scoreboard players remove @s money 1000`);
        });
    },
    no_have_vehicle: (player) => {
        let form = new ActionFormData();
        form.title(`Vehicle`);
        form.body(`คุณยังไม่มีรถที่พร้อมใช้งาน`);
        form.button(`คุณยังไม่มีรถที่พร้อมใช้งาน`);
        form.show(player);
    }
}
function ShowVehicles(player, playerName) {
    let vehicleData = loadData("vehicleData");
    let playerCars = Object.keys(vehicleData).filter(vehicleId => vehicleData[vehicleId].owner === playerName && player.hasTag(vehicleData[vehicleId].requiredTag)).map(vehicleId => vehicleData[vehicleId].displayName);
    if (playerCars.length === 0) {
        player.sendMessage(`§cไม่พบรถของผู้เล่น §a${playerName}`);
        player.runCommand(`playsound note.bass`);
        return;
    } else {
        let form = new ActionFormData();
        form.title(`รถของ ${playerName}`);
        form.body(`รถทั้งหมดที่เป็นของผู้เล่น §a${playerName}\n§c(เป็นรถที่ยังไม่เบิก)`);
        playerCars.forEach(vehicle => form.button(vehicle));
        form.show(player);
    }
}

let AdminMenu = {
    Main: () => {
        let form = new ActionFormData();
        form.title(`Admin Menu`);
        form.body(`เลือกเมนูที่ต้องการ`);
        form.button(`Add vehicle`, `textures/ui/recipe_book_expand_icon`);
        form.button(`Remove vehicle`, `textures/ui/recipe_book_collapse_icon`);
        form.button(`View vehicles of player`, `textures/ui/realmsStoriesIcon`);
        return form;
    },
    AddVehicle: (player) => {
        let form = new ModalFormData();
        form.title(`เพิ่มรถ`);
        form.textField(`ID รถ`, `เช่น: minecraft:pig`);
        form.textField(`ใส่ชื่อโชว์`, `เช่น: หมู`);
        form.textField(`แท็กที่ต้องใช้ (ผู้เล่น)`, `เช่น: pigcar`);
        form.show(player).then(r => {
            if (r.canceled) return;
            let vehicleId = r.formValues[0];
            let vehicleName = r.formValues[1];
            let playerTag = r.formValues[2];
            vehicleData[vehicleId] = {
                displayName: vehicleName,
                requiredTag: playerTag,
                owner: player.name
            };
            player.sendMessage(`§aเพิ่ม: §c${vehicleName} §aสำเร็จ`);
            player.runCommand(`playsound random.orb`);
            saveData("vehicleData", vehicleData);
        });
    },
    RemoveVehicle: (player) => {
        let vehicles = getVehicle(player);
        if (vehicles.length === 0) {
            player.sendMessage(`§cไม่พบรถในข้อมูล`);
            player.runCommand(`playsound note.bass`);
            return;
        }
        let form = new ActionFormData();
        form.title(`ลบรถ`);
        form.body(`เลือกรถที่ต้องการลบ`);
        vehicles.forEach(vehicle => form.button(vehicle.displayName));
        form.show(player).then(r => {
            if (r.canceled) return;
            let selectedCar = vehicles[r.selection];
            delete vehicleData[selectedCar.id];
            saveData("vehicleData", vehicleData);
            player.sendMessage(`§aลบรถ §c${selectedCar.displayName} §aเรียบร้อยแล้ว`);
            player.runCommand(`playsound random.orb`);
        });
    },
    CheckVehicles: (player) => {
        let loadedVehicleData = loadData("vehicleData");
        let players = Array.from(new Set(Object.values(loadedVehicleData).map(vehicle => vehicle.owner)))
        if (players.length === 0) {
            player.sendMessage("§cไม่มีผู้เล่นที่มีรถในข้อมูล");
            player.runCommand(`playsound note.bass`);
            return;
        }
        let form = new ActionFormData();
        form.title("เช็ครถผู้เล่น");
        form.body("กรุณาเลือกชื่อผู้เล่นที่ต้องการเช็ครถ");
        players.forEach(playerName => form.button(`${playerName}`));
        form.show(player).then(r => {
            if (r.canceled) return;
            let selectedPlayer = players[r.selection];
            ShowVehicles(player, selectedPlayer);
        });
    }
};
export { Vehicle, AdminMenu }