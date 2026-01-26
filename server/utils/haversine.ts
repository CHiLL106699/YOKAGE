/**
 * Haversine 公式計算兩個地理座標之間的距離
 * @param lat1 第一個點的緯度
 * @param lon1 第一個點的經度
 * @param lat2 第二個點的緯度
 * @param lon2 第二個點的經度
 * @returns 距離 (米)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 地球半徑 (米)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // 距離 (米)
  return Math.round(distance * 100) / 100; // 四捨五入到小數點後兩位
}

/**
 * 驗證座標是否在地理圍欄範圍內
 * @param userLat 使用者緯度
 * @param userLon 使用者經度
 * @param centerLat 中心點緯度
 * @param centerLon 中心點經度
 * @param radiusMeters 半徑 (米)
 * @returns 是否在範圍內
 */
export function isWithinGeofence(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLon, centerLat, centerLon);
  return distance <= radiusMeters;
}

/**
 * 驗證座標有效性
 * @param lat 緯度
 * @param lon 經度
 * @returns 是否有效
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
