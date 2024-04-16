import { 
  BACKGROUND, COLOR, 
  CANVAS_HIGHT, CANVAS_WIDTH, 
  CARD_HIGHT, CARD_WIDTH, 
  LINE_X_POSITION,
  LINE_X_GAP, LINE_Y_GAP,
  CRUDE_LINE,
  LINE_GAP,
  FINE_LINE,
} from "./constant/mapping";

import { 
  Config,
  CurrentPointType,
  ListData, 
  MapStartPointToEndPoints, 
  MousePoint, 
  Options, 
  Point,
  TreeData, 
  TreeFormated, 
  TreeToListMap 
} from "./interface/mapping";
import { drawRectangle } from "./utils/rectangle";

export class MappingDiagram {
  private ctx: CanvasRenderingContext2D | null = null
  private offScreenCanvas: HTMLCanvasElement| null = null
  private ratio = {
    width: 1,
    height: 1
  }
  private treeToList: TreeFormated[] = []
  private mapWithStartAndEndPoint: MapStartPointToEndPoints = {}
  private curPointType: CurrentPointType = ''
  private curPoint: Point = { dx: 0, dy: 0 }
  private firstId = ''
  private lastId = ''

  private defaultOptions: Options = {
    width: CANVAS_WIDTH,
    height: CANVAS_HIGHT,
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

  mounted() {
    this.options = Object.assign({}, this.defaultOptions, this.options)
    
    this.ratio.width = CANVAS_WIDTH /  this.options.width 
    this.ratio.height = CANVAS_HIGHT / this.options.height

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

  updated () {

  }

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
    this.treeToList = this.treeToList.map((item, index) => {
      const point = {
        dx: LINE_X_POSITION + (item.level + 1) * LINE_X_GAP,
        dy: (index + 1) * LINE_Y_GAP,
      }

      return {
        ...item,
        point
      }
    })


    this.list = this.list.map((item, index) => {
      const point = {
        dx:  CANVAS_WIDTH - LINE_X_POSITION - LINE_X_GAP - CARD_WIDTH,
        dy: (index + 1) * LINE_Y_GAP,
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
      background, color
    } = this.options as Options

    this.offScreenCanvas = document.createElement('canvas')
    this.offScreenCanvas.width = CANVAS_WIDTH
    this.offScreenCanvas.height = CANVAS_HIGHT

    const osCtx = this.offScreenCanvas.getContext('2d')
    if (!osCtx){
      return
    }
    osCtx.beginPath()
    osCtx.fillStyle = background!
    osCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HIGHT)

    osCtx.save()
    osCtx.strokeStyle = color!
    osCtx.lineWidth = CRUDE_LINE
    osCtx.moveTo(LINE_X_POSITION - LINE_GAP - CRUDE_LINE, 0)
    osCtx.lineTo(LINE_X_POSITION - LINE_GAP - CRUDE_LINE, CANVAS_HIGHT)
    osCtx.stroke()
    osCtx.restore()

    osCtx.save()
    osCtx.strokeStyle = color!
    osCtx.lineWidth = FINE_LINE
    osCtx.moveTo(LINE_X_POSITION, 0)
    osCtx.lineTo(LINE_X_POSITION, CANVAS_HIGHT)
    osCtx.stroke()
    osCtx.restore()

    osCtx.closePath()

    this.treeToList.map((item, index) => this.drawTreeItem(osCtx,item, index))
    this.list.map(item => this.drawListItem(osCtx, item))
  }

  private drawTreeItem (ctx: CanvasRenderingContext2D, data: TreeFormated, index: number) {
    const { point: { dx, dy }, name } = data as Required<TreeFormated>
    const { color } = this.options as Options

    ctx.beginPath()
    ctx.save()
    ctx.strokeStyle = color!
    if (data.childNum) {
      ctx.moveTo(LINE_X_POSITION + (data.level + 1) * LINE_X_GAP, (index + 1) * LINE_Y_GAP + LINE_X_GAP)
      ctx.lineTo(LINE_X_POSITION + (data.level + 1) * LINE_X_GAP, (index + 1) * LINE_Y_GAP + LINE_X_GAP + data.childNum * LINE_Y_GAP - LINE_X_GAP / 2)
    }
    ctx.moveTo(LINE_X_POSITION + data.level * LINE_X_GAP, (index + 1) * LINE_Y_GAP + LINE_X_GAP / 2)
    ctx.lineTo(LINE_X_POSITION + (data.level + 1) * LINE_X_GAP, (index + 1) * LINE_Y_GAP + LINE_X_GAP / 2)
    ctx.stroke()

    ctx.restore()
    ctx.closePath()
    drawRectangle(ctx, { color,  rectangle: { dx, dy, width: CARD_WIDTH, height: CARD_HIGHT } }  as Config , name)
  }

  private drawListItem (ctx: CanvasRenderingContext2D, data: ListData) {
    const { point: { dx, dy }, label } = data as Required<ListData>
    const { color } = this.options as Options
    drawRectangle(ctx, { color,  rectangle: { dx, dy, width: CARD_WIDTH, height: CARD_HIGHT }} as Config, label)
  }


  private initMapWithStartEndPoint () {
    Object.entries(this.map).forEach(([key, value]) => {
      const keyDetail = this.treeToList.find(item => item.id === key)
      const valueDetailList = this.list.filter(item => value.includes(item.id))

      if (keyDetail && valueDetailList.length) {
        const point = (keyDetail as Required<TreeFormated>).point
        const startPoint = {
          dx: point.dx + CARD_WIDTH,
          dy: point.dy + CARD_HIGHT / 2
        }
        const endPointList = valueDetailList.map(item => {
          const point = (item as Required<ListData>).point
          return {
            dx: point.dx,
            dy: point.dy + CARD_HIGHT / 2
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

    for (let i = 0; i < this.treeToList.length; i++) {
      const { point: { dx, dy }, id } = this.treeToList[i] as Required<TreeFormated>
      if (mouseX >= dx && mouseX <= dx + CARD_WIDTH && mouseY >= dy && mouseY <= dy + CARD_HIGHT ) {
        this.curPointType = 'treeItem'
        this.curPoint = { dx, dy }
        this.firstId = id
      }
    }

    for (let i = 0; i < this.list.length; i++) {
      const { point: { dx, dy }, id } = this.list[i] as Required<ListData>
      if (mouseX >= dx && mouseX <= dx + CARD_WIDTH && mouseY >= dy && mouseY <= dy + CARD_HIGHT ) {
        this.curPointType = 'listItem'
        this.curPoint = { dx, dy }
        this.firstId = id
      }
    }
  }
  private mousemoveHandler (event: MouseEvent) {
    if (!this.curPointType) {
      return
    }
    const { offsetX, offsetY } = event
    const mouseX = offsetX * this.ratio.width; 
    const mouseY = offsetY * this.ratio.height
    this.drawLine({ mouseX, mouseY })
  }
  private  mouseupHandler (event: MouseEvent) {
    const { offsetX, offsetY } = event
    const endX = offsetX * this.ratio.width ; 
    const endY = offsetY * this.ratio.height

    let mouseX, mouseY
    if (this.curPointType === 'treeItem') {
      for (let i = 0; i < this.list.length; i++) {
        const { point: { dx, dy }, id } = this.list[i] as Required<ListData>
        if (endX >= dx && endX <= dx + CARD_WIDTH && endY >= dy && endY <= dy + CARD_HIGHT) {
          this.lastId = id

          if (!this.map[this.firstId]) {
            this.map[this.firstId] = []
          }
          this.map[this.firstId].push(this.lastId)

          mouseX = dx
          mouseY = dy + CARD_HIGHT / 2
        }
      }
    }
    if (this.curPointType === 'listItem') {
      for (let i = 0; i < this.treeToList.length; i++) {
        const { point: { dx, dy }, id } = this.treeToList[i] as Required<TreeFormated>
        if (endX >= dx && endX <= dx + CARD_WIDTH && endY >= dy && endY <= dy + CARD_HIGHT) {
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
    this.curPointType = ''
    this.curPoint = { dx: 0, dy: 0 }
  }

  private drawLine ({ mouseX, mouseY }: MousePoint) {
    if (!this.ctx) {
      return
    }
    const { color } = this.options as Options
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HIGHT)
    this.ctx.drawImage(this.offScreenCanvas!, 0, 0, CANVAS_WIDTH, CANVAS_HIGHT)
    this.drawInitMapLine()

    let startX, startY
    if (this.curPointType === 'treeItem') {
      startX = this.curPoint.dx + CARD_WIDTH
      startY = this.curPoint.dy + CARD_HIGHT / 2
    } else {
      startX = this.curPoint.dx
      startY = this.curPoint.dy + CARD_HIGHT / 2
    }
    this.ctx.beginPath()
    this.ctx.save()
    this.ctx.moveTo(startX, startY)
    this.ctx.lineTo(mouseX, mouseY)
    this.ctx.strokeStyle = color!
    this.ctx.stroke()
    this.ctx.restore()
    this.ctx.closePath()
  }
}
