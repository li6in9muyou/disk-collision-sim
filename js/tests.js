import {
  buildConfig,
  createStateFromDiskDynamics,
  SingleDiskBouncingNoDraw,
  TwoDimElasticCollisionNoDraw,
} from "./config.js";
import { shuffleInPlace } from "./helper.js";
import { eq, gt, gte, lenSqr } from "./math.js";

function it(msg, assert) {
  return (...args) => {
    if (assert(...args) === false) {
      console.error("test failed: " + msg);
      return false;
    } else {
      return true;
    }
  };
}

export const testDiskBouncingAgainstWall = () =>
  assertOneDiskPosition({ x: 50, y: 50 }, { x: 0, y: -40 }, [
    { x: 50, y: 50 },
    { x: 50, y: 20 },
    { x: 50, y: 60 },
    { x: 50, y: 80 },
    { x: 50, y: 40 },
    { x: 50, y: 20 },
  ]);

export const testDiskBouncingAgainstWallHorizontal = () =>
  assertOneDiskPosition({ x: 50, y: 50 }, { x: -40, y: 0 }, [
    { x: 50, y: 50 },
    { x: 20, y: 50 },
    { x: 60, y: 50 },
    { x: 80, y: 50 },
    { x: 40, y: 50 },
    { x: 20, y: 50 },
  ]);

function assertOneDiskPosition(initP, initV, expectedP) {
  const id = 1000;

  const init = () =>
    createStateFromDiskDynamics({
      entities: [id],
      velocity: new Map([[id, initV]]),
      position: new Map([[id, initP]]),
      size: new Map([[id, { w: 40, h: 40 }]]),
      mass: new Map([[id, 40]]),
      ARENA_W: 100,
      ARENA_H: 100,
    });

  const asserts = [
    it("should bounce back at arena wall", (ctx) => {
      const expected = expectedP[ctx.iteration];
      if (expected !== undefined) {
        const v = ctx.position.get(id);
        return eq(v.x, expected.x) && eq(v.y, expected.y);
      } else {
        return true;
      }
    }),
  ];

  return [SingleDiskBouncingNoDraw, init, asserts];
}

export function testPushAnotherDisk() {
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000, 1001],
      position: [
        [1000, { x: 208.9999552389763, y: 675.9999999999992 }],
        [1001, { x: 209.00001138216948, y: 755.3916666666664 }],
      ],
      size: [
        [1000, { w: 40, h: 40 }],
        [1001, { w: 80, h: 80 }],
      ],
      velocity: [
        [1000, { x: -0.000003078615392322873, y: 65.59999999999994 }],
        [1001, { x: 7.696538480807182e-7, y: 30.39999999999999 }],
      ],
      mass: [
        [1000, 40],
        [1001, 160],
      ],
      ARENA_W: 418,
      ARENA_H: 889,
    });
  const asserts = [
    it("should collide then separate and keep moving", ({
      elapsed,
      position,
      velocity,
    }) => {
      let dCenter;
      switch (elapsed) {
        case 1:
          // collide
          dCenter = Math.abs(position.get(1000).y - position.get(1001).y);
          return eq(dCenter, 60);
        case 2:
          // separate
          dCenter = Math.abs(position.get(1000).y - position.get(1001).y);
          return (
            gt(dCenter, 60) &&
            gt(velocity.get(1000).y, 0) &&
            gt(velocity.get(1001).y, 0)
          );
        case 3:
          // separate
          dCenter = Math.abs(position.get(1000).y - position.get(1001).y);
          return gt(dCenter, 60);
        default:
          return true;
      }
    }),
  ];
  return [TwoDimElasticCollisionNoDraw, init, asserts];
}

export function testTwoArenaCollisionInTwoFrames() {
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000],
      position: [[1000, { x: 39.67829218060014, y: 207.04960014440516 }]],
      size: [[1000, { w: 40, h: 40 }]],
      velocity: [[1000, { x: -22.856316635357658, y: 62.34986671480171 }]],
      mass: [[1000, 40]],
      ARENA_W: 300,
      ARENA_H: 300,
    });
  const asserts = [
    it("should collide with arena twice", ({ elapsed, position }) => {
      const p = position.get(1000);
      switch (elapsed) {
        case 1:
          return eq(p.x, 20);
        case 2:
          return eq(p.y, 280);
        default:
          return true;
      }
    }),
  ];
  return [TwoDimElasticCollisionNoDraw, init, asserts];
}

export function testDiskCollideWithArenaAtTimeZero() {
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000],
      position: [[1000, { x: 200, y: 280 }]],
      size: [[1000, { w: 40, h: 40 }]],
      velocity: [[1000, { x: -100, y: 100 }]],
      mass: [[1000, 40]],
      ARENA_W: 300,
      ARENA_H: 300,
    });
  const asserts = [
    it("should bounce off arena wall", ({ elapsed, position, velocity }) => {
      const v = velocity.get(1000);
      const p = position.get(1000);
      switch (elapsed) {
        case 1:
          return gt(0, v.x);
        case 2:
          return gt(0, v.x) && gt(280, p.y);
        default:
          return true;
      }
    }),
  ];
  return [TwoDimElasticCollisionNoDraw, init, asserts];
}

export function testRoundingErrorIsManageable() {
  const ARENA_W = 100;
  const ARENA_H = 500;
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000, 1001],
      velocity: new Map([
        [1000, { x: 0, y: 10 }],
        [1001, { x: 0, y: -40 }],
      ]),
      position: new Map([
        [1000, { x: ARENA_W / 2, y: 20 }],
        [1001, { x: ARENA_W / 2, y: ARENA_H - 40 }],
      ]),
      size: new Map([
        [1000, { w: 40, h: 40 }],
        [1001, { w: 80, h: 80 }],
      ]),
      mass: new Map([
        [1000, 40],
        [1001, 160],
      ]),
      iteration: 0,
      collideNormal: new Map(),
      distanceUntilCollision: new Map(),
      timeUntilCollision: new Map(),
      collideWith: new Map(),
      vPtrJqTable: new Map(),
      ARENA_W,
      ARENA_H,
    });
  const asserts = [
    it("should not have v.x", ({ velocity }) => {
      const p1 = velocity.get(1000);
      const p2 = velocity.get(1001);
      return eq(p1.x, 0) && eq(p2.x, 0);
    }),
  ];
  return [TwoDimElasticCollisionNoDraw, init, asserts];
}

export function testRoundingErrorIsManageable2() {
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000, 1001],
      position: [
        [1000, { x: 209.0000118061715, y: 599.6223999995648 }],
        [1001, { x: 209.0000118061715, y: 660.7698155849632 }],
      ],
      size: [
        [1000, { w: 40, h: 40 }],
        [1001, { w: 80, h: 80 }],
      ],
      velocity: [
        [1000, { x: 0, y: 82.80319999993782 }],
        [1001, { x: 0, y: 16.908799999968934 }],
      ],
      mass: [
        [1000, 40],
        [1001, 160],
      ],
      ARENA_W: 418,
      ARENA_H: 889,
    });
  const asserts = [
    it("should not have v.x", ({ velocity }) => {
      const p1 = velocity.get(1000);
      const p2 = velocity.get(1001);
      return eq(p1.x, 0) && eq(p2.x, 0);
    }),
  ];
  return [TwoDimElasticCollisionNoDraw, init, asserts];
}

export function testCollisionIsNeverMissed() {
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000, 1001],
      position: [
        [1000, { x: 50, y: 20 }],
        [1001, { x: 50, y: 97.33528575999992 }],
      ],
      size: [
        [1000, { w: 40, h: 40 }],
        [1001, { w: 80, h: 80 }],
      ],
      velocity: [
        [1000, { x: 0, y: 2.214487040000016 }],
        [1001, { x: 0, y: -40.29607936 }],
      ],
      mass: [
        [1000, 40],
        [1001, 160],
      ],
      ARENA_W: 100,
      ARENA_H: 500,
    });
  const asserts = [
    it("two disks should never swap places", ({ position }) => {
      const p1 = position.get(1000);
      const p2 = position.get(1001);
      return gt(p2.y, p1.y);
    }),
  ];
  return [TwoDimElasticCollisionNoDraw, init, asserts];
}

export function testDiskHitArenaCorner() {
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000, 1001],
      position: [
        [1000, { x: 30.786796564403566, y: 30.786796564403573 }],
        [1001, { x: 153.21320343559643, y: 153.21320343559643 }],
      ],
      size: [
        [1000, { w: 40, h: 40 }],
        [1001, { w: 80, h: 80 }],
      ],
      velocity: [
        [1000, { x: -44.00000000000001, y: -44 }],
        [1001, { x: -3.9999999999999996, y: -4.000000000000002 }],
      ],
      mass: [
        [1000, 40],
        [1001, 160],
      ],
      ARENA_W: 300,
      ARENA_H: 300,
    });
  const asserts = [
    it("should move in south east direction", ({ elapsed, velocity }) => {
      const v = velocity.get(1000);
      if (elapsed === 2) {
        return eq(v.x / v.y, 1);
      }
      return true;
    }),
  ];
  return [TwoDimElasticCollisionNoDraw, init, asserts];
}

export function testEveryCollisionQueryAccessLatestDynamics() {
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000, 1001],
      position: [
        [1000, { x: 50, y: 20.903040559116537 }],
        [1001, { x: 50, y: 80.90304055911653 }],
      ],
      size: [
        [1000, { w: 40, h: 40 }],
        [1001, { w: 80, h: 80 }],
      ],
      velocity: [
        [1000, { x: 0, y: -65.8024192 }],
        [1001, { x: 0, y: -23.29185279999999 }],
      ],
      mass: [
        [1000, 40],
        [1001, 160],
      ],
      ARENA_W: 100,
      ARENA_H: 200,
    });
  const asserts = [
    it("rear disk should collide with front disk after front disk collides with arena", ({
      elapsed,
      position,
      size,
    }) => {
      const pFront = position.get(1000);
      const pRear = position.get(1001);
      const sFront = size.get(1000);
      const sRear = size.get(1001);
      switch (elapsed) {
        case 1:
        case 2:
          const dist = Math.sqrt(
            lenSqr(pFront.x - pRear.x, pFront.y - pRear.y),
          );
          return gte(dist, sFront.w + sRear.w);
        default:
          return true;
      }
    }),
  ];
  return [
    buildConfig
      .from(TwoDimElasticCollisionNoDraw)
      .system((_, { entities }) => shuffleInPlace(entities))
      .build(),
    init,
    asserts,
  ];
}

export function testNewtonCradle() {
  const TOTAL_H = 9 * 40;
  const init = () =>
    createStateFromDiskDynamics({
      entities: [1000, 2001, 2002, 2003, 1001],
      position: [
        [1000, { x: 50, y: 20 }],
        [2001, { x: 50, y: TOTAL_H / 2 - 40 }],
        [2002, { x: 50, y: TOTAL_H / 2 }],
        [2003, { x: 50, y: TOTAL_H / 2 + 40 }],
        [1001, { x: 50, y: TOTAL_H / 2 + 40 * 2 }],
      ],
      size: [
        [1000, { w: 40, h: 40 }],
        [1001, { w: 40, h: 40 }],
        [2001, { w: 40, h: 40 }],
        [2002, { w: 40, h: 40 }],
        [2003, { w: 40, h: 40 }],
      ],
      velocity: [
        [1000, { x: 0, y: 11.23456 }],
        [1001, { x: 0, y: 0 }],
        [2001, { x: 0, y: 0 }],
        [2002, { x: 0, y: 0 }],
        [2003, { x: 0, y: 0 }],
      ],
      mass: [
        [1000, 40],
        [1001, 40],
        [2001, 40],
        [2002, 40],
        [2003, 40],
      ],
      ARENA_W: 100,
      ARENA_H: TOTAL_H,
    });
  const asserts = [
    it("three disks in the middle remain perfectly stationary", ({
      velocity,
    }) => {
      const stationaryDisks = [2001, 2002, 2003];
      return stationaryDisks
        .map((id) => velocity.get(id))
        .every((v) => eq(0, v.x) && eq(0, v.y));
    }),
  ];
  return [
    buildConfig
      .from(TwoDimElasticCollisionNoDraw)
      .system((_, { entities }) => shuffleInPlace(entities))
      .build(),
    init,
    asserts,
  ];
}

export default [
  testDiskBouncingAgainstWall,
  testDiskBouncingAgainstWallHorizontal,
  testDiskCollideWithArenaAtTimeZero,
  testDiskHitArenaCorner,
  testRoundingErrorIsManageable,
  testPushAnotherDisk,
  testTwoArenaCollisionInTwoFrames,
  testCollisionIsNeverMissed,
  testRoundingErrorIsManageable2,
  testEveryCollisionQueryAccessLatestDynamics,
  testNewtonCradle,
];
