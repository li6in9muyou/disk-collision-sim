import { isFunction } from "./helper.js";
import {
  applyConservationOfMomentum,
  applyKeepMoving,
  applyReflectedVelocityIfCollideWithArena,
  applyRoundMinimalVelocityToZero,
  drawOrangeDisk,
  drawVelocityPointer,
  logDiskDistance,
  logDiskDynamics,
  logElapsed,
  logIteration,
  logReproductionInfo,
  queryArenaCollision,
  queryDiskCollision,
  queryMinTimeUntilCollision,
} from "./system.js";

export const commonLogSuite = [
  logReproductionInfo,
  logDiskDistance,
  logDiskDynamics,
  logIteration,
  logElapsed,
];

export const arenaCollision = [queryArenaCollision, queryMinTimeUntilCollision];
export const arenaAndDiskCollision = [
  queryArenaCollision,
  queryDiskCollision,
  queryMinTimeUntilCollision,
];

export const domDrawer = [drawOrangeDisk, drawVelocityPointer];

export const twoDimElastic = [
  applyKeepMoving,
  applyReflectedVelocityIfCollideWithArena,
  applyConservationOfMomentum,
  applyRoundMinimalVelocityToZero,
];

export function buildConfig() {
  const addFnTo = (set) => (fnOrFnList) => {
    if (isFunction(fnOrFnList)) {
      set.add(fnOrFnList);
    } else if (isFunction(fnOrFnList.forEach)) {
      fnOrFnList.forEach((qq) => set.add(qq));
    }
    return configBuilder;
  };

  const queries = new Set();
  const systems = new Set();
  const drawers = new Set();
  const debuggers = new Set();
  const configBuilder = {
    query: addFnTo(queries),
    system: addFnTo(systems),
    drawer: addFnTo(drawers),
    debug: addFnTo(debuggers),
    build() {
      return [queries, systems, drawers, debuggers];
    },
  };
  return configBuilder;
}

buildConfig.from = function (config) {
  const [queries, systems, drawers, debuggers] = config;
  return buildConfig()
    .query(queries)
    .system(systems)
    .drawer(drawers)
    .debug(debuggers);
};

export const TwoDimElasticCollision = buildConfig()
  .query(arenaAndDiskCollision)
  .system(twoDimElastic)
  .drawer(domDrawer)
  .debug(commonLogSuite)
  .build();

export const TwoDimElasticCollisionNoDraw = buildConfig()
  .query(arenaAndDiskCollision)
  .system(twoDimElastic)
  .debug(commonLogSuite)
  .build();

export const SingleDiskBouncing = buildConfig()
  .query(arenaCollision)
  .system(twoDimElastic)
  .drawer(domDrawer)
  .debug(commonLogSuite)
  .build();

export const SingleDiskBouncingNoDraw = buildConfig()
  .query(arenaCollision)
  .system(twoDimElastic)
  .debug(commonLogSuite)
  .build();

export function createStateFromDiskDynamics(ps) {
  function toMap(a) {
    if (!(a instanceof Map)) {
      return new Map(a);
    } else {
      return a;
    }
  }

  ps.position = toMap(ps.position);
  ps.size = toMap(ps.size);
  ps.velocity = toMap(ps.velocity);
  ps.mass = toMap(ps.mass);
  return {
    iteration: 0,
    minTimeUntilCollision: 1,
    collideNormal: new Map(),
    distanceUntilCollision: new Map(),
    timeUntilCollision: new Map(),
    collideWith: new Map(),
    domTableDisk: new Map(),
    domTableVelocityPointer: new Map(),
    ...ps,
  };
}
