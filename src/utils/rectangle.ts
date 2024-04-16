import { CRUDE_LINE, FINE_LINE, FONT, LINE_GAP, TEXT_BASE_LINE, CARD_PADDING } from "../constant/mapping";
import { Config } from "../interface/mapping";

/**
 * 
 * @param ctx CanvasRenderingContext2D
 * @param config Config
 * @param text string
 */
export const drawRectangle = (
  ctx: CanvasRenderingContext2D, 
  config: Config, 
  text: string
) => {
  const { color, rectangle: { dx, dy, width, height }} = config

  ctx.beginPath()
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = CRUDE_LINE
  ctx.strokeRect(dx, dy, width, height)

  ctx.lineWidth = FINE_LINE
  ctx.strokeRect(
    dx + (CRUDE_LINE + LINE_GAP), 
    dy + (CRUDE_LINE + LINE_GAP), 
    width - (CRUDE_LINE + LINE_GAP) * 2, 
    height - (CRUDE_LINE + LINE_GAP) * 2
  )

  ctx.font = FONT
  ctx.fillStyle = color
  ctx.textBaseline = TEXT_BASE_LINE

  const overflowText = textOverflowHandler(ctx, text, width - (CARD_PADDING +  CRUDE_LINE + LINE_GAP) * 2)

  ctx.fillText(
    overflowText, 
    dx + (CRUDE_LINE + LINE_GAP) + CARD_PADDING, 
    dy + (CRUDE_LINE + LINE_GAP), width - (CRUDE_LINE + LINE_GAP) * 2
  )

  ctx.restore()
  ctx.closePath()
}


/**
 * 
 * @param ctx 
 * @param text 
 * @param limit 
 */
const textOverflowHandler = (ctx: CanvasRenderingContext2D, text: string, limit: number): string => {
  if (ctx.measureText(text).width < limit){
    return text
  } else {
    let newText = ''
    const textList = text.split('')
    for (let i = textList.length; i > 0; i--) {
      const subText = text.slice(0, i) + '...'
      if(ctx.measureText(subText).width < limit){
        newText = subText
        break;
      }
    }
    return newText
  }
}