export interface TreeToListMap {
  [key: string]: string[]
}

export interface TreeData {
  id: string,
  name: string,
  children?: TreeData[]
}

export interface TreeFormated {
  id: string,
  name: string,
  parentId: string,
  level: number,
  childNum: number,
  point?: Point
}

export interface ListData {
  id: string,
  label: string,
  point?: Point
}

export interface Options {
  width: number,
  height: number,
  background?: string,
  color?: string,
}

// export interface RequiredOptions {
//   width: number,
//   height: number,
// }

export interface Point {
  dx: number,
  dy: number
}

export interface Rectangle extends Point{
  width: number,
  height: number
}

export interface Config {
  color: string,
  rectangle: Rectangle,
}

export interface MousePoint {
  mouseX: number,
  mouseY: number
}

export interface MapStartPointToEndPoints {
  [key: string]: {
    startPoint: Point,
    endPointList: Point[]
  }
}

export type CurrentPointType = 'treeItem' | 'listItem' | ''