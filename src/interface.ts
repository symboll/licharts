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
  line_x_position?: number,
  line_x_gap?: number, 
  line_y_gap?: number,
  card_width?: number, 
  card_height?: number
}
 
export interface Point {
  dx: number,
  dy: number
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