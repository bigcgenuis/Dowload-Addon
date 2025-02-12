import { world, system } from "@minecraft/server";
import { getVehicles } from "./Function/MainFunctionVehicle";
import { AdminMenu, Vehicle } from "./FormUi/MenuVehicle"

world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    let target = e.target;
    let player = e.player;
    let vehicles = getVehicles(player);
    if (target.hasTag(`vehicle_spawn`)) {
        if (vehicles.length === 0) {
            e.cancel = true;
            system.run(() => {
                Vehicle.no_have_vehicle(player);
                return;
            })
        }
        if (vehicles.length > 0) {
            e.cancel = true;
            system.run(() => {
               Vehicle.spawn_vehicle(player); 
            })
        }
    };
    if (target.hasTag(`vehicle_remove`)) {
        e.cancel = true;
        system.run(() => {
            Vehicle.remove_vehicle(player);
        })
    };
    if (target.hasTag(`vehicle_reset`)) {
        e.cancel = true;
        system.run(() => {
            Vehicle.reset_vehicle(player);
        })
    }
});
world.beforeEvents.itemUse.subscribe(e => {
    let player = e.source;
    let item = e.itemStack;
    if (item.nameTag === `Vehicle` && player.hasTag(`Admin`)) {
        system.run(() => {
            AdminMenu.Main().show(player).then(r => {
                if (r.selection === 0) {
                    AdminMenu.AddVehicle(player);
                }
                if (r.selection === 1) {
                    AdminMenu.RemoveVehicle(player);
                }
                if (r.selection === 2) {
                    AdminMenu.CheckVehicles(player);
                }
            })
        })
    } else if (item.nameTag === `Vehicle` && !player.hasTag(`Admin`)) {
        player.sendMessage(`§cYou don't have permission`);
        system.run(() => {
            player.runCommand(`playsound note.bass`);
        })
    }
})