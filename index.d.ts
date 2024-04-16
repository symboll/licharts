
declare class MappingDiagram {
  constructor(
    instance: HTMLCanvasElement,
    list: ListData[],
    tree: TreeData[],
    map: TreeToListMap,
    options: Partial<Options> & RequiredOptions
  );
  mounted (): void
  updated (): void
  destroyed(): void
}

export {
  MappingDiagram
}

declare namespace licharts {}
export default licharts
