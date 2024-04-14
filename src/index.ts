import { 
  BACKGROUND, COLOR, 
  CANVAS_HIGHT, CANVAS_WIDTH, 
  CARD_HIGHT, CARD_WIDTH, 
  LINE_X_POSITION,
  LINE_X_GAP, LINE_Y_GAP,
} from "./constant";

import { 
  ListData, 
  MapStartPointToEndPoints, 
  MousePoint, 
  Options, 
  Point,
  TreeData, 
  TreeFormated, 
  TreeToListMap 
} from "./interface";

class LiCharts {
  ctx: CanvasRenderingContext2D | null = null
  offScreenCanvas: HTMLCanvasElement| null = null
  ratio = {
    width: 1,
    height: 1
  }
  treeToList: TreeFormated[] = []
  //
  mapWithStartAndEndPoint: MapStartPointToEndPoints = {}
  currentFlag = ''
  currentPoint: Point = { dx: 0, dy: 0 }
  firstId = ''
  lastId = ''

  defaultOptions: Required<Options> = {
    width: CANVAS_WIDTH,
    height: CANVAS_HIGHT,

    card_width: CARD_WIDTH,
    card_height: CARD_HIGHT,

    line_x_position: LINE_X_POSITION,
    line_x_gap: LINE_X_GAP,
    line_y_gap: LINE_Y_GAP,

    background: BACKGROUND,
    color: COLOR
  }

  constructor (
    private instance: HTMLCanvasElement,
    private list: ListData[],
    private tree: TreeData[],
    private map: TreeToListMap,
    private options: Options
  ) {}

  /**
   * licycle
   */
  mounted() {
    Object.assign(this.defaultOptions, this.options)
    
    this.ratio.width = CANVAS_WIDTH /  this.defaultOptions.width 
    this.ratio.height = CANVAS_HIGHT / this.defaultOptions.height

    this.instance.addEventListener('mousedown', (event) => this.mousedownHandler(event))
    this.instance.addEventListener('mousemove', (event) => this.mousemoveHandler(event))
    this.instance.addEventListener('mouseup', (event) => this.mouseupHandler(event))

    this.instance.width = CANVAS_WIDTH
    this.instance.height = CANVAS_HIGHT
    this.ctx = this.instance.getContext('2d')

    this.dataTransform(this.tree)
    this.dataFormat()
    this.drawOffScreenCanvas()
    this.ctx!.drawImage(this.offScreenCanvas!, 0 , 0 ,CANVAS_WIDTH, CANVAS_HIGHT)

    this.drawInitMapLine()
  }

  /**
   * licycle
   */
  destroyed() {
    this.instance.removeEventListener('mousedown', (event) => this.mousedownHandler(event))
    this.instance.removeEventListener('mousemove', (event) => this.mousemoveHandler(event))
    this.instance.removeEventListener('mouseup', (event) => this.mouseupHandler(event))
    this.ctx = null
  }

  /**
   * 树型结构数据 转换成 列表结构数据
   */
  private dataTransform (tree: TreeData[], parentId = '0', level = 0) {
    for (let i = 0; i < tree.length; i++) {
      const { children = [], id, name } = tree[i]
      this.treeToList.push({
        id,
        name,
        parentId,
        level,
        childNum: children.length
      })
      if (children.length) {
        this.dataTransform(children, id, level + 1)
      }
    }
  }

  /**
   * 数据格式化，带上绘制的 位置信息
   */
  private dataFormat () {
    const {
      line_x_position,
      line_x_gap, line_y_gap,
      card_width
    } = this.defaultOptions

    this.treeToList = this.treeToList.map((item, index) => {
      const point = {
        dx: line_x_position + (item.level + 1) * line_x_gap,
        dy: (index + 1) * line_y_gap,
      }

      return {
        ...item,
        point
      }
    })


    this.list = this.list.map((item, index) => {
      const point = {
        dx:  CANVAS_WIDTH - line_x_position - line_x_gap - card_width,
        dy: (index + 1) * line_y_gap,
      }
      return {
        ...item,
        point
      }
    })

  }

  /**
   * 绘制离屏canvas
   */
  private drawOffScreenCanvas () {
    const { 
      background, color,
      line_x_position
   } = this.defaultOptions

    this.offScreenCanvas = document.createElement('canvas')
    this.offScreenCanvas.width = CANVAS_WIDTH
    this.offScreenCanvas.height = CANVAS_HIGHT

    const osCtx = this.offScreenCanvas.getContext('2d')
    if (!osCtx){
      return
    }

    osCtx.fillStyle = background
    osCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HIGHT)
    osCtx.moveTo(line_x_position, 0)
    osCtx.lineTo(line_x_position, CANVAS_HIGHT)
    osCtx.strokeStyle = color
    osCtx.stroke()

    this.treeToList.map((item, index) => this.drawTreeItem(osCtx,item, index))
    this.list.map(item => this.drawListItem(osCtx, item))
  }

  private drawTreeItem (ctx: CanvasRenderingContext2D, data: TreeFormated, index: number) {
    const { point: { dx, dy }, name } = data as Required<TreeFormated>
    const { color, line_x_position, line_x_gap, line_y_gap, card_width, card_height } = this.defaultOptions

    ctx.beginPath()
    ctx.save()
    ctx.strokeStyle = color
    ctx.strokeRect(dx, dy, card_width, card_height)

    if (data.childNum) {
      ctx.moveTo(line_x_position + (data.level + 1) * line_x_gap, (index + 1) * line_y_gap + line_x_gap)
      ctx.lineTo(line_x_position + (data.level + 1) * line_x_gap, (index + 1) * line_y_gap + line_x_gap + data.childNum * line_y_gap - line_x_gap / 2)
    }

    ctx.moveTo(line_x_position + data.level * line_x_gap, (index + 1) * line_y_gap + line_x_gap / 2)
    ctx.lineTo(line_x_position + (data.level + 1) * line_x_gap, (index + 1) * line_y_gap + line_x_gap / 2)
    ctx.strokeStyle = color
    ctx.stroke()

    ctx.font = '60px sans-serif'
    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    ctx.fillText(name, dx, dy, card_width)

    ctx.restore()
    ctx.closePath()
  }

  private drawListItem (ctx: CanvasRenderingContext2D, data: ListData) {
    const { point: { dx, dy }, label } = data as Required<ListData>
    const { color, card_width, card_height } = this.defaultOptions
    ctx.beginPath()
    ctx.save()
    ctx.strokeStyle = color
    ctx.strokeRect(dx, dy, card_width, card_height)
    ctx.font = '60px sans-serif'
    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    ctx.fillText(label, dx, dy)
    ctx.restore()
    ctx.closePath()
  }


  private initMapWithStartEndPoint () {
    const { card_width, card_height } = this.defaultOptions
    Object.entries(this.map).forEach(([key, value]) => {
      const keyDetail = this.treeToList.find(item => item.id === key)
      const valueDetailList = this.list.filter(item => value.includes(item.id))

      if (keyDetail && valueDetailList.length) {
        const point = (keyDetail as Required<TreeFormated>).point
        const startPoint = {
          dx: point.dx + card_width,
          dy: point.dy + card_height / 2
        }
        const endPointList = valueDetailList.map(item => {
          const point = (item as Required<ListData>).point
          return {
            dx: point.dx,
            dy: point.dy + card_height / 2
          }
        })

        if (!this.mapWithStartAndEndPoint[key]) {
          this.mapWithStartAndEndPoint[key] = {
            startPoint,
            endPointList: [...endPointList],
          }
        } else {
          this.mapWithStartAndEndPoint[key].endPointList.push(...endPointList)
        }
      }
    })
  }

  /**
   * 绘制 初始化 映射关系
   */
  private drawInitMapLine () {
    this.initMapWithStartEndPoint()
    Object.entries(this.mapWithStartAndEndPoint).forEach(([key, value]) => {
      const startPoint = value.startPoint
      value.endPointList.forEach(endPoint => {
        this.drawMapSingleLine(startPoint, endPoint)
      })
    })
  }

  private drawMapSingleLine (start: Point, end: Point) {
    if (!this.ctx) {
      return
    }
    this.ctx.beginPath()
    this.ctx.save()
    this.ctx.moveTo(start.dx, start.dy)
    this.ctx.lineTo(end.dx, end.dy)
    this.ctx.strokeStyle = COLOR
    this.ctx.stroke()
    this.ctx.restore()
    this.ctx.closePath()
  }

  private mousedownHandler (event: MouseEvent) {
    const { offsetX, offsetY } = event

    const mouseX = offsetX * this.ratio.width; 
    const mouseY = offsetY * this.ratio.height

    const { card_width, card_height } = this.defaultOptions

    for (let i = 0; i < this.treeToList.length; i++) {
      const { point: { dx, dy }, id } = this.treeToList[i] as Required<TreeFormated>
      if (mouseX >= dx && mouseX <= dx + card_width && mouseY >= dy && mouseY <= dy + card_height ) {
        this.currentFlag = 'treeItem'
        this.currentPoint = { dx, dy }
        this.firstId = id
      }
    }

    for (let i = 0; i < this.list.length; i++) {
      const { point: { dx, dy }, id } = this.list[i] as Required<ListData>
      if (mouseX >= dx && mouseX <= dx + card_width && mouseY >= dy && mouseY <= dy + card_height ) {
        this.currentFlag = 'listItem'
        this.currentPoint = { dx, dy }
        this.firstId = id
      }
    }
  }
  private mousemoveHandler (event: MouseEvent) {
    if (!this.currentFlag) {
      return
    }
    const { offsetX, offsetY } = event
    const mouseX = offsetX * this.ratio.width; const mouseY = offsetY * this.ratio.height
    this.drawLine({ mouseX, mouseY })
  }
  private  mouseupHandler (event: MouseEvent) {
    const { offsetX, offsetY } = event
    const endX = offsetX * this.ratio.width ; 
    const endY = offsetY * this.ratio.height
    const { card_width, card_height } = this.defaultOptions

    let mouseX, mouseY
    if (this.currentFlag === 'treeItem') {
      for (let i = 0; i < this.list.length; i++) {
        const { point: { dx, dy }, id } = this.list[i] as Required<ListData>
        if (endX >= dx && endX <= dx + card_width && endY >= dy && endY <= dy + card_height) {
          this.lastId = id

          if (!this.map[this.firstId]) {
            this.map[this.firstId] = []
          }
          this.map[this.firstId].push(this.lastId)

          mouseX = dx
          mouseY = dy + card_height / 2
        }
      }
    }
    if (this.currentFlag === 'listItem') {
      for (let i = 0; i < this.treeToList.length; i++) {
        const { point: { dx, dy }, id } = this.treeToList[i] as Required<TreeFormated>
        if (endX >= dx && endX <= dx + card_width && endY >= dy && endY <= dy + card_height) {
          this.lastId = id
          if (!this.map[this.lastId]) {
            this.map[this.lastId] = []
          }
          this.map[this.lastId].push(this.firstId)

          mouseX = dx + CARD_WIDTH
          mouseY = dy + CARD_HIGHT / 2
        }
      }
    }

    this.mapWithStartAndEndPoint = {}
    this.initMapWithStartEndPoint()

    if (!this.ctx) {
      return
    }

    // 鼠标抬起的时候，落入另一个卡片之中，需要画线连接
    if (this.lastId) {
      this.drawLine({ mouseX, mouseY } as MousePoint)
    } else {
      this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HIGHT)
      this.ctx.drawImage(this.offScreenCanvas!, 0, 0, CANVAS_WIDTH, CANVAS_HIGHT)
      this.drawInitMapLine()
    }

    this.firstId = ''
    this.lastId = ''
    this.currentFlag = ''
    this.currentPoint = { dx: 0, dy: 0 }
  }

  private drawLine ({ mouseX, mouseY }: { mouseX: number, mouseY: number }) {
    if (!this.ctx) {
      return
    }
    const { color, card_height, card_width } = this.defaultOptions
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HIGHT)
    this.ctx.drawImage(this.offScreenCanvas!, 0, 0, CANVAS_WIDTH, CANVAS_HIGHT)
    this.drawInitMapLine()

    let startX, startY
    if (this.currentFlag === 'treeItem') {
      startX = this.currentPoint.dx + card_width
      startY = this.currentPoint.dy + card_height / 2
    } else {
      startX = this.currentPoint.dx
      startY = this.currentPoint.dy + card_height / 2
    }
    this.ctx.beginPath()
    this.ctx.save()
    this.ctx.moveTo(startX, startY)
    this.ctx.lineTo(mouseX, mouseY)
    this.ctx.strokeStyle = color
    this.ctx.stroke()
    this.ctx.restore()
    this.ctx.closePath()
  }
}


export default LiCharts