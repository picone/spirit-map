const pi = 3.14159265358979324 * 3000.0 / 180.0
const intExponent = 6
const intMulti = Math.pow(10, intExponent)

/**
 * 火星坐标系转百度坐标系
 * @param point
 * @returns {{lng: number, lat: number}}
 */
export function mars2bd (point) {
  const z = Math.sqrt(point.lng * point.lng + point.lat * point.lat) + 0.00002 * Math.sin(point.lat * pi)
  const theta = Math.atan2(point.lat, point.lng) + 0.000003 * Math.cos(point.lng * pi)
  return {
    lng: z * Math.cos(theta) + 0.0065,
    lat: z * Math.sin(theta) + 0.006
  }
}

/**
 * 百度坐标系转火星坐标系
 * @param point
 * @returns {{lng: number, lat: number}}
 */
export function bd2mars (point) {
  const x = point.lng - 0.0065
  const y = point.lat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi)
  return {
    lng: z * Math.cos(theta),
    lat: z * Math.sin(theta)
  }
}

/**
 * 坐标转为整数表示
 * @param point
 * @returns {{lng: number, lat: number}}
 */
export function intPoint (point) {
  return {
    lng: Math.round(intMulti * point.lng),
    lat: Math.round(intMulti * point.lat)
  }
}

/**
 * 坐标转为小数表示
 * @param point
 * @returns {{lng: string, lat: string}}
 */
export function floatPoint (point) {
  return {
    lng: (point.lng / intMulti).toFixed(intExponent),
    lat: (point.lat / intMulti).toFixed(intExponent)
  }
}

/**
 * 基于投射法判断点是否在闭合的曲线区域内
 * @desc http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @param point
 * @param path
 * @returns {boolean}
 */
export function pointInPath (point, path) {
  let inside = false
  for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
    const pointA = path[i]
    const pointB = path[j]
    const intersect = ((pointA.lng > point.lng) !== (pointB.lng > point.lng)) &&
      (point.lat < (pointB.lat - pointA.lat) * (point.lng - pointA.lng) / (pointB.lng - pointA.lng) + pointA.lat)
    if (intersect) inside = !inside
  }
  return inside
}
