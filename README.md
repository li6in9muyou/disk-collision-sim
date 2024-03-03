# disk collision simulation

## Context object

This object type is used in many places

```ts
type Vec = {
  x: number;
  y: number;
};

type DiskDynamics = {
  entities: number[];
  position: Map<number, Vec>;
  velocity: Map<number, Vec>;
  size: Map<number, { w: number; h: number }>;
  mass: Map<number, number>;
};

type SimulationCtx = {
  iteration: number;
};

type CollisionQueryCtx = {
  collideNormal: Map<number, Vec>;
  distanceUntilCollision: Map<number, number>;
  timeUntilCollision: Map<number, number>;
  collideWith: Map<number, number>;
};

type RendererCtx = {
  domTableDisk: Map<number, jQuery>;
  domTableVelocityPointer: Map<number, jQuery>;
};

type Context = SimulationCtx & CollisionQueryCtx & RendererCtx & DiskDynamics;
```

## notes

### how to copy a directory from a git repo and make it a new repo while preserving relevant commit history

1. Create a new git repo, `git init`
2. Set original repo as a remote, `git remote add hmwk file://path/to/original/repo`
3. Download history from original repo, `git remote update`
4. List commits that change this directory, `git log -- day2009-bouncing-discs`. Or use helper in IDE.
5. Cherry-pick commits from remote, `git cherry-pick f1a6884d^..5dfa0336` if commits are consecutive. Or cherry-pick them one by one.

Reference:

- [https://www.baeldung.com/linux/git-copy-commits-between-repos](https://www.baeldung.com/linux/git-copy-commits-between-repos)
