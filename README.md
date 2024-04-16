# LiCharts

`licharts` is a canvas collection.

## Usage
`npm install licharts --save`

```ts
import { MappingDiagram } from "licharts";

const instance = new MappingDiagram(
  canvas, 
  list, 
  tree, 
  map,
  options 
)

instance.mounted()
```
### MappingDiagram Attributes
| name |  arguments | description |
| :----: | :----: | :----: |
| canvas | HTMLCanvasElement | canvas HTML Element |
| list | `{id: 'id', label: 'label' }[]` | right data |
| tree | `{ id: 'id', name: 'name', children: [] }` |  left data |
| map | `{ treeItemId: listItemId[] }` | map data|
| options |  Options | config |
|  |  width: number | canvas style width  |
|  |  height: number | canvas style height |
|  |  background: string | canvas style bg |
|  |  color: string | canvas line color |
