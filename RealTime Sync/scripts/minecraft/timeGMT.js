export function getTime(gmtZone) {
    let now = new Date();
    now.setHours(now.getUTCHours() + gmtZone);
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    let gameTime = 0;
    if (h >= 6 && h < 18) {
      let day = h - 6;
      gameTime = (day * 1000) + ((m / 60) * 1000) + ((s / 3600) * 1000);
    } else if (h >= 18 || h < 6) {
      let nightgameTime = h >= 18 ? h - 18 : h + 6;
      gameTime = 12000 + (nightgameTime * 1000) + ((m / 60) * 1000) + ((s / 3600) * 1000);
    }
    return {
      h,
      m,
      s,
      gmtTime: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`/*+`:${s.toString().padStart(2, "0")}`*/,
      gameTime: Math.floor(gameTime),
    };
}