import { Body } from "matter-js";
import { Func } from "../core/func";
import { MyDisplay } from "../core/myDisplay";
import { Util } from "../libs/util";
import { WaveMatterjsMgr } from "./waveMatterjsMgr";
import { CatmullRomCurve3, Vector3 } from "three";
import { Tween } from "../core/tween";
import { Slider } from "./slider";
import { Conf } from "../core/conf";
import { MousePointer } from "../core/mousePointer";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  private _waveMatterMgr: WaveMatterjsMgr

  private _pointNum:number = Func.val(Conf.NUM_XS, Conf.NUM_LG)
  private _slider: Array<Slider> = []

  private _mouse: HTMLInputElement

  constructor(opt:any) {
    super(opt)

    for(let i = 0; i < this._pointNum; i++) {
      // slider作成
      const sl = document.createElement('div')
      sl.classList.add('l-slider')
      this.el.appendChild(sl)
      const slider = new Slider({
        el: sl,
        itemId: i,
      })
      this._slider.push(slider)
    }

    this._waveMatterMgr = new WaveMatterjsMgr({
      body: this.el
    })

    this._mouse = document.createElement('input') as HTMLInputElement
    this._mouse.type = 'checkbox'
    this._mouse.classList.add('l-mouse')
    this.el.appendChild(this._mouse)
    // this._mouse.value = 'mouse'
    this._mouse.checked = true

    this._resize()
  }

  protected _update():void {
    super._update()

    this._makePoint()

    const mw = 100

    Tween.set(this._mouse, {
      width: mw,
      height: mw,
      x: MousePointer.instance.x - mw * 0.5,
      y: MousePointer.instance.y - mw * 0.5,
    })
  }

  protected  _resize(): void {
    const sw = Func.sw()
    this._slider.forEach((val,i) => {
      Tween.set(val.el, {
        x: (sw / (this._slider.length - 1)) * i,
        y: 0
      })
    })
  }

  private _makePoint():void {
    const sw = Func.sw()
    const sh = Func.sh()

    const arr:any = []
    const bodies:Array<Body> = this._waveMatterMgr.itemInfo
    if(bodies != undefined) {
      bodies.forEach((val,i) => {
        let x = val.position.x
        let y = val.position.y
        if(i == 0) x = 0
        if(i == bodies.length - 1) x = sw
        arr.push(new Vector3(x, y, 0));
      })
    }

    const curve = new CatmullRomCurve3(arr, false)
    const points = curve.getPoints(this._pointNum)

    points.forEach((val,i) => {
      const sl = this._slider[i]
      if(sl != undefined) {
        sl.setValue(100 - Util.map(val.y, 0, 100, 0, sh))
      }
    });
  }
}