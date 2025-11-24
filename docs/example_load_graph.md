# Load a graph

## Graph property on SigmaContainer
Component `SigmaContainer` can take a `graph` property which is either a graph instance or a graph constructor.

```tsx
<SigmaContainer graph={graph} />
```

So you can use it to load your graph.

## By using useLoadGraph
In a children component of `SigmaContainer`, you can use the hook `useLoadGraph`.

```tsx
const loadGraph = useLoadGraph();
```

This hook is just returns a function that takes a graphology instance, and load it in Sigma.
Per default, when the `SigmaContainer` is mounted, the library create a default graphology graph (see [https://graphology.github.io/instantiation.html](https://graphology.github.io/instantiation.html)). But you can define the type of graph that react-sigma will create by passing the constructor you want to use.

```tsx
<SigmaContainer graph={MultiDirectedGraph}>
```

This step is mandatory if you want to use a multi graph (ie. parallel edges).
