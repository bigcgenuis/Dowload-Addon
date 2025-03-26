import { system, world } from "@minecraft/server";

export let scoreboard = {
    addObjectives: (objective, displayName = objective) => {
        system.run(() => {
            world.getDimension(`overworld`).runCommand(`scoreboard objectives add `+objective+ ` dummy ` + displayName)
        });
    },
    removeObjectives: (objective) => {
        system.run(() => {
            world.getDimension(`overworld`).runCommand(`scoreboard objectives remove `+objective)
        });
    },
    setdisplay: (objective, display) => {
        system.run(() => {
            world.getDimension(`overworld`).runCommand(`scoreboard objectives setdisplay `+display+` `+objective)
        });
    },
    addScore: (player, objective, value) => {
        system.run(() => {
            player.runCommand(`scoreboard players add @s ${objective} ${value}`)
        });
    },
    removeScore: (player, objective, value) => {
        system.run(() => {
            player.runCommand(`scoreboard players remove @s ${objective} ${value}`)
        });
    },
    setScore: (player, objective, value) => {
        system.run(() => {
            player.runCommand(`scoreboard players set @s ${objective} ${value}`)
        });
    },
    resetScore: (player, objective) => {
        system.run(() => {
            player.runCommand(`scoreboard players reset @s ${objective}`)
        });
    },
    getScore: (player, objective, noNaN = true) => {
        try {
            let obj = world.scoreboard.getObjective(objective);
            if (typeof player == 'string') {
                return obj.getScore(obj.getParticipants().find(v => v.displayName == player)) ?? (noNaN ? 0 : null);
            }
            return obj.getScore(player.scoreboardIdentity) ?? (noNaN ? 0 : null);
        } catch {
            return noNaN ? 0 : null;
        }
    }
}

export let title = {
    title: (player, text) => {
        system.run(() => {
            player.runCommand(`titleraw `+player.name+` title {"rawtext":[{"text":"`+text+`"}]}`)
        });
    },
    actionbar: (player, text) => {
        system.run(() => {
            player.runCommand(`titleraw `+player.name+` actionbar {"rawtext":[{"text":"`+text+`"}]}`)
        });
    },
    subtitle: (player, text) => {
        system.run(() => {
            player.runCommand(`titleraw `+player.name+` subtitle {"rawtext":[{"text":"`+text+`"}]}`)
        });
    }
}

export let command = {
    lockLeg: (player) => {
        system.run(() => {
            player.runCommand(`inputpermission set @s movement disabled`)
        });
    },
    unLockLeg: (player) => {
        system.run(() => {
            player.runCommand(`inputpermission set @s movement enabled`)
        });
    },
    lockCemera: (player) => {
        system.run(() => {
            player.runCommand(`inputpermission set @s camera disabled`)
        });
    },
    unLockCemera: (player) => {
        system.run(() => {
            player.runCommand(`inputpermission set @s camera enabled`)
        });
    },
    addEffect: (player, effect, time, level, hideParticles = true) => {
        system.run(() => {
            player.runCommand(`effect @s ${effect} ${time} ${level} ${hideParticles}`)
        });
    },
    removeEffect: (player, effect) => {
        system.run(() => {
            player.runCommand(`effect @s ${effect} 0 0 true`)
        });
    }
}