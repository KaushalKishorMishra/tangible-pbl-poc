# Project structure

## Core
The [core](https://sim51.github.io/react-sigma/docs/api/core) is the main one with [components](https://sim51.github.io/react-sigma/docs/api/core#component) and [hooks](https://sim51.github.io/react-sigma/docs/api/core#hook) that help you to display a graph with react.

```bash
npm install @react-sigma/core
```

## Layout modules
There is one module per graphology layout, plus one for the genericity ([layout-core](https://sim51.github.io/react-sigma/docs/api/layout-core)).
In graphology, there are two types of layout :
- None iterative layouts that just need to be call to compute once for all the spatialisation (ex: random, circle).
- Iterative layouts, that need to spawn a web worker to continuously run the algo (ex: forceatlas2)

### None iterative layouts

#### Description
For those layouts, in the corresponding module we export a hook that you can call to :
- compute the new nodes position (the `positions` function)
- compute the new nodes position and assign it to the sigma graph (the `assign` function)

#### How to use it
1. Install the module
   ```bash
   npm install @react-sigma/layout-circular graphology-layout
   ```

2. Import the useLayoutCircular hook
   ```javascript
   import { useLayoutCircular } from "@react-sigma/layout-circular";
   ```

3. Initialize the hook in your component (that must be a child of SigmaContainer)
   ```javascript
   const {positions, assign} = useLayoutCircular(...);
   ```

4. Use the positions function
   ```javascript
   import { animateNodes } from "sigma/utils/animate";
   ...
   useEffect(() => {
     animateNodes(sigma.getGraph(), positions(), { duration: 1000 });
   }, [positions, sigma]);
   ```

5. Or use the assign function
   ```javascript
   useEffect(() => {
     assign(sigma.getGraph());
   }, [assign, sigma]);
   ```

#### Available layouts
- [layout-random](https://sim51.github.io/react-sigma/docs/api/layout-random)
- [layout-circular](https://sim51.github.io/react-sigma/docs/api/layout-circular)
- [layout-circlepack](https://sim51.github.io/react-sigma/docs/api/layout-circlepack)

### Iterative layouts

#### Description
For those layouts, in the corresponding module we export :
- the same hook than for none iterative layouts (it run a fix number of iteration of the algo that can be configured in the hook: `useLayoutForceAtlas2({ iterations: 100 })`
- A hook to manage the worker layout : `const {stop, start, kill, isRunning} = useWorkerLayoutForceAtlas2(...)`
- A control component that use the above hook, to display a stop/start button on the graph

#### How to use it
1. Install the module
   ```bash
   npm install @react-sigma/layout-forceatlas2 graphology-layout-forceatlas2
   ```

2. Inside the SigmaContainer just add the component :
   ```tsx
   import { LayoutForceAtlas2Control } from "@react-sigma/layout-forceatlas2";
   ...
   <SigmaContainer>
     <MyGraph />
     <ControlsContainer position={"bottom-right"}>
       <LayoutForceAtlas2Control />
     </ControlsContainer>
   </SigmaContainer>
   ```

#### Available layouts
- [layout-forceatlas2](https://sim51.github.io/react-sigma/docs/api/layout-forceatlas2)
- [layout-force](https://sim51.github.io/react-sigma/docs/api/layout-force)
- [layout-noverlap](https://sim51.github.io/react-sigma/docs/api/layout-noverlap)
