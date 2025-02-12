import { loadData } from "../../database/oldDB"
function getVehicles(player) {
    let vehicleData = loadData("vehicleData")
    return Object.keys(vehicleData).filter(vehicleId => vehicleData[vehicleId].owner === player.nameTag && player.hasTag(vehicleData[vehicleId].requiredTag)).map(vehicleId => ({ id: vehicleId, displayName: vehicleData[vehicleId].displayName, tag: vehicleData[vehicleId].requiredTag }));
};
function getVehicle(player) {
    let vehicleData = loadData("vehicleData")
    return Object.keys(vehicleData)
        .filter(vehicleId => vehicleData[vehicleId].owner === player.nameTag)
        .map(vehicleId => ({ id: vehicleId, displayName: vehicleData[vehicleId].displayName }));
}
function getVehiclesSpawned(player) {
    let vehicleData = loadData("vehicleData")
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
export { getVehicles, getVehicle, getVehiclesSpawned }