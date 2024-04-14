declare class LiCharts {
  constructor(
    instance: HTMLCanvasElement,
    list: ListData[],
    tree: TreeData[],
    map: TreeToListMap,
    options: Partial<Options>
  );
  mounted (): void
  destroyed(): void
}

export default LiCharts
