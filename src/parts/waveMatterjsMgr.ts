import { Bodies, Body, Composite, Engine, Render, Runner, Composites, Constraint } from "matter-js";
import { Conf } from "../core/conf";
import { Func } from "../core/func";
import { MyObject3D } from "../webgl/myObject3D";
import { MousePointer } from "../core/mousePointer";

export class WaveMatterjsMgr extends MyObject3D {

  private _runner:Runner;
  private _isStart:boolean = false;

  public engine:Engine;
  public render:Render;
  public mouse:Body;
  public isUpdate:boolean = true;
  public item:Array<Composite> = [];
  public itemInfo:Array<Body> = [];

  constructor(opt: any) {
    super()

    // エンジン
    this.engine = Engine.create();
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;

    // レンダラー
    this.render = Render.create({
      element: opt.body,
      engine: this.engine,
      options: {
        width: Func.sw(),
        height: Func.sh(),
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false,
        pixelRatio:Conf.FLG_SHOW_MATTERJS ? 1 : 0.1
      }
    });
    this.render.canvas.classList.add('l-matter');

    if(!Conf.FLG_SHOW_MATTERJS) {
      this.render.canvas.classList.add('-hide');
    }

    // this._makeLine(sh * 0.2);

    // マウス
    const mouseSize = Func.sw() * Func.val(0.2, 0.12) * 1;
    this.mouse = Bodies.circle(0, 0, mouseSize, {isStatic:true, render:{visible: Conf.FLG_SHOW_MATTERJS}});
    Composite.add(this.engine.world, [
      this.mouse,
    ]);
    Body.setPosition(this.mouse, {x:9999, y:9999});

    this._runner = Runner.create();

    this.start()
    this._makeBody()
    this._resize()
  }

  private _makeBody(): void {
    const sw = Func.sw();
    const sh = Func.sh();
    const baseY = sh * Func.val(0.5, 0.5)

    const stiffness = 0.01;
    const stackNum = 1;
    const bridgeNum = 15;
    const bridgeSize = (sw / bridgeNum) * 0.45;

    for(let i = 0; i < stackNum; i++) {

      const x = (sw - Func.sw()) * -0.5;
      const y = baseY;

      const x2 = x + sw;
      const y2 = y;

      let group = Body.nextGroup(true);
      const bridge = Composites.stack(x, y, bridgeNum, 1, 0, 0, (x:number, y:number) => {
        return Bodies.circle(x, y, bridgeSize, {
          collisionFilter: { group: group },
          render: {
            fillStyle: '#060a19',
            visible: Conf.FLG_SHOW_MATTERJS
          }
        });
      });
      Composites.chain(bridge, 0, 0, 0, 0, {
        stiffness: stiffness,
        length: 0,
        render: {
          visible: Conf.FLG_SHOW_MATTERJS
        }
      });

      const length = 1;
      Composite.add(this.engine.world, [
        bridge,
        Constraint.create({
            pointA: { x: x, y: y },
            bodyB: bridge.bodies[0],
            pointB: { x: 0, y: 0 },
            length: length,
            stiffness: 1
        }),
        Constraint.create({
            pointA: { x: x2, y: y2 },
            bodyB: bridge.bodies[bridge.bodies.length - 1],
            pointB: { x: 0, y: 0 },
            length: length,
            stiffness: 1
        })
      ]);
      this.item.push(bridge);
    }

    this.item.forEach((val) => {
      val.bodies.forEach((b,i) => {
        Body.setPosition(b, {
          x:(sw / bridgeNum) * i,
          y:baseY
        })
        this.itemInfo.push(b);
      })
    })
  }


  public start(): void {
    if(this._isStart) return
    this._isStart = true

    Render.run(this.render);
    Runner.run(this._runner, this.engine);
  }


  public stop(): void {
    if(!this._isStart) return
    this._isStart = false

    Render.stop(this.render);
    Runner.stop(this._runner);
  }


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update();

    if(!this.isUpdate) return

    let mx = MousePointer.instance.x
    let my = MousePointer.instance.y
    if(Conf.USE_TOUCH && MousePointer.instance.isDown == false) {
      mx = 9999
      my = 9999
    }

    Body.setPosition(this.mouse, {x:mx, y:my});
  }


  protected _resize(): void {
    super._resize();

    this.render.canvas.width = Func.sw()
    this.render.canvas.height = Func.sh()
  }
}