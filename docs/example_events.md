# Events

Sigma dispatch various events that you can listen :
- mouse events
- touch events
- camera events
- graph events
- ...

With react-sigma you can listen to all those events with the help of the hook [useRegisterEvents](https://sim51.github.io/react-sigma/docs/api/core/functions/useRegisterEvents).

This hook helps you to register your listeners (and also do the remove for you).

## Example Usage
(Check the code below to see how to do it, and don't forget to open your browser console in preview mode.)

```tsx
import { useEffect } from "react";
import { useRegisterEvents, useSigma } from "@react-sigma/core";

const GraphEvents = () => {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();

  useEffect(() => {
    // Register the events
    registerEvents({
      // mouse events
      clickNode: (event) => console.log("clickNode", event.node),
      doubleClickNode: (event) => console.log("doubleClickNode", event.node),
      rightClickNode: (event) => console.log("rightClickNode", event.node),
      wheelNode: (event) => console.log("wheelNode", event.node),
      downNode: (event) => console.log("downNode", event.node),
      enterNode: (event) => console.log("enterNode", event.node),
      leaveNode: (event) => console.log("leaveNode", event.node),
      
      // graph events
      clickStage: (event) => console.log("clickStage", event),
      
      // camera events
      updated: (event) => console.log("updated", event),
    });
  }, [registerEvents, sigma]);

  return null;
};
```
