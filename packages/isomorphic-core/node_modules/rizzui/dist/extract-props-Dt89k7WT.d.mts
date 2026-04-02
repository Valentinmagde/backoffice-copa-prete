type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : T;

export type { ExtractProps as E };
