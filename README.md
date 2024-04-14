
# use
`npm install licharts --save`

```ts
import LiCharts from "licharts";

interface ListData {
  id: string,
  label: string,
  point?: Point
}

interface TreeData {
  id: string,
  name: string,
  children?: TreeData[]
}

interface TreeToListMap {
  [key: string]: string[]
}

interface Options {
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

const canvas:HTMLCanvasElement
const list: ListData
const tree: TreeData
const map: TreeToListMap
const options: Options

const liCharts = new LiCharts(
  canvas, 
  list, 
  tree, 
  map,
  options 
)
```
