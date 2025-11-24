# Minimap

You can display a minimap of the graph, to know which portion of the graph you are viewing.
To use it, you need to install the package `@react-sigma/minimap`.

```bash
npm install @react-sigma/minimap
```

The you can use the [Minimap](https://sim51.github.io/react-sigma/docs/api/minimap/functions/MiniMap) component provided by the package like in this example :

```tsx
import { SigmaContainer, ControlsContainer } from "@react-sigma/core";
import { MiniMap } from "@react-sigma/minimap";
import "@react-sigma/core/lib/style.css";

export const DisplayGraphWithMinimap = () => {
  return (
    <SigmaContainer style={{ height: "500px", width: "500px" }}>
      <MyGraph />
      <ControlsContainer position={"bottom-right"}>
        <MiniMap />
      </ControlsContainer>
    </SigmaContainer>
  );
};
```
