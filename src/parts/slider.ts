import { MyDisplay } from "../core/myDisplay";
import { Func } from "../core/func";
import { Tween } from "../core/tween";
import { Conf } from "../core/conf";

// -----------------------------------------
//
// -----------------------------------------
export class Slider extends MyDisplay {

  private _items: Array<HTMLInputElement> = []

  // アルファベット全部、小文字大文字
  private _txtTable: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  constructor(opt:any) {
    super(opt)

    this._c = opt.itemId

    const num = 1
    for (let i = 0; i < num; i++) {
      const el = document.createElement('input') as HTMLInputElement
      el.classList.add('js-item-input')
      el.type = 'text'
      this.el.appendChild(el)
      this._items.push(el)
    }

    this._resize()
  }

  public setValue(v :number):void {
    const fontSize = 14
    const sh = Func.sh()
    this._items.forEach((item) => {
      if(item != document.activeElement) {
        let t = ''
        const numMax = ~~((sh / fontSize) * (v / 100)) * 1.2
        for (let i = 0; i < numMax; i++) {
          t += this._txtTable[(this._c + i) % this._txtTable.length]
        }
        item.value = t
      }
    })
  }

  protected _update():void {
    super._update()
  }

  protected  _resize(): void {
    super._resize()

    const num = Func.val(Conf.NUM_XS, Conf.NUM_LG)
    const w = Func.sh() * 0.8
    const h = (Func.sw() / num) * 0.75

    this._items.forEach((item) => {
      Tween.set(item, {
        width: w,
        height: h,
        rotationZ: -90,
        y: Func.sh() * 0.5 + w * 0.5 - h * 0.5
      })
    })
  }
}







