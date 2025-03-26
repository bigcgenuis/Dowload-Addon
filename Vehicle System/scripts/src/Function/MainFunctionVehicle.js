import { loadData } from "../../database/oldDB";

async function getVehicles(player) {
    let vehicleData = await loadData("vehicleData");
    return Object.keys(vehicleData).filter(vehicleId => vehicleData[vehicleId].owner === player.nameTag && player.hasTag(vehicleData[vehicleId].requiredTag))
        .map(vehicleId => ({ id: vehicleId, displayName: vehicleData[vehicleId].displayName, tag: vehicleData[vehicleId].requiredTag }));
}

async function getVehicle(player) {
    let vehicleData = await loadData("vehicleData");

    // พิมพ์ข้อมูลที่ได้จาก loadData ออกมาเพื่อดูว่าใน vehicleData มีหลายค่าหรือไม่
    console.log(JSON.stringify(vehicleData)); // ตรวจสอบค่า vehicleData

    // กรองข้อมูล
    return Object.keys(vehicleData)
        .filter(vehicleId => vehicleData[vehicleId].owner === player.nameTag)
        .map(vehicleId => ({ id: vehicleId, displayName: vehicleData[vehicleId].displayName }));
}


async function getVehiclesSpawned(player) {
    let vehicleData = await loadData("vehicleData");
    let vehicles = [];
    for (let vehicleId in vehicleData) {
        let requiredTag = vehicleData[vehicleId].requiredTag;
        let spawnTag = `${requiredTag}spawn`;
        if (player.hasTag(spawnTag)) {
            vehicles.push({ id: vehicleId, displayName: vehicleData[vehicleId].displayName, tag: requiredTag });
        }
    }
    return vehicles;
}

export { getVehicles, getVehicle, getVehiclesSpawned };
