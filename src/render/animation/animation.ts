import EventEmitter from "events";
import Phaser from "phaser";
import { AnimationData } from "./data";
import { AnimationLoader } from "./loader";

export class AnimationObject {
  public image: Phaser.GameObjects.Image;
  public imageOutline: Phaser.GameObjects.Image;
  public imageRenderOutline: Phaser.GameObjects.RenderTexture;
  public action: number = 0;
  public frame: number = 0;
  public delay: number = 0;
  public loop: boolean = true;
  public pause: boolean = false;
  public framerate: number = 1/24;
  public reversed: boolean = false;
  public ready: boolean = false;
  public emitter: EventEmitter = new EventEmitter();

  public ox: number = 0;
  public oy: number = 0;

  public constructor(
    public scene: Phaser.Scene & { entity: Phaser.GameObjects.Group },
    public animation: string,
    public x: number,
    public y: number
  ) {
    this.image = scene.add.image(x, y, "cas");
    this.imageOutline = scene.add.image(x, y, "cas");
    this.imageRenderOutline = scene.add.renderTexture(x, y, 200, 200);
    this.imageOutline.setAlpha(0.01);
    this.image.setVisible(false);
    this.imageOutline.setVisible(false);

    this.imageRenderOutline.setVisible(false);

    scene.entity.add(this.image);
    const load = AnimationLoader.loadAnimation(scene, animation);
    if (load === true) {
      this.init();
    } else {
      load?.once("complete", () => {
        this.init();
      });
    }
  }

  public init() {
    this.getFrame();
    this.image.setVisible(true);
    this.image.update = () => {
      this.playAction(this.action, this.loop);
    };
    this.ready = true;
  }

  public getFrame() {
    const data = AnimationData.get(this.scene, this.animation);
    if (!data) return;
    const texture = this.scene.textures.get(
      `animation-${this.animation}-${this.action}`
    );
    if (!data.actionsFrames.get(this.action)) {
      this.action = 0;
      return;
    }
    const metadata = data.actionsMetadata.get(this.action);
    const frame = data?.actionsFrames?.get(this.action)?.get(this.frame);
    if (frame && metadata) {
      if (!texture.has(this.frame.toString()))
        texture.add(
          this.frame.toString(),
          0,
          frame.x,
          frame.y,
          metadata.width,
          metadata.height
        );
      this.image.setTexture(texture.key);

      this.image.setFrame(this.frame.toString());
      this.image.setDisplayOrigin(
        metadata.points[0].x + this.ox,
        metadata.points[0].y + this.oy
      );

      this.imageRenderOutline.setDepth(500);
      this.imageOutline.setTexture(texture.key);
      this.imageOutline.setFrame(this.frame.toString());
      this.imageOutline.setOrigin(0);
      // this.imageOutline.setDisplayOrigin(metadata.pivot.x, metadata.pivot.y);
      this.imageRenderOutline.clear();
      this.imageRenderOutline.draw(this.imageOutline, 0, 0);
      this.imageRenderOutline.setDisplayOrigin(
        metadata.points[0].x + this.ox,
        metadata.points[0].y + this.oy
      );
      // const colorPipeline = (this.scene.renderer as any).pipelines.get(
      //   "ColorFX"
      // );

      // this.imageRenderOutline.setPipeline(colorPipeline);
    }
  }

  public playActionByName(name : string, loop = true) {
    if (this.ready) {
      const actionData = AnimationData.get(this.scene, this.animation);
      if (actionData) {
        const actionId = actionData.actionNames.get(name) ?? 0;
        this.playAction(actionId, loop);
      }
    } else {
      const load = AnimationLoader.loadAnimation(this.scene, this.animation);
      if (load === true) {
        const actionData = AnimationData.get(this.scene, this.animation);
      if (actionData) {
        const actionId = actionData.actionNames.get(name) ?? 0;
        this.playAction(actionId);
      }
      } else {
        load?.once("complete", () => {
          const actionData = AnimationData.get(this.scene, this.animation);
      if (actionData) {
        const actionId = actionData.actionNames.get(name) ?? 0;
        this.playAction(actionId);
      }
        });
      }
    }
    
  }

  public playAction(action: number, replay: boolean = true) {
    const data = AnimationData.get(this.scene, this.animation);
    if (!data) return;
    if (this.pause) return;
    this.loop = replay;
    if (this.reversed) {
      if (this.action !== action) {
        this.action = action;
        this.frame = this.getAnimationSize() ?? 1;
        this.delay = this.framerate;
        this.getFrame();
      } else if (this.delay > 0) {
        this.delay -= this.framerate;
      } else {
        if (!data.actionsFrames.get(this.action)) return;
        const end = data?.actionsFrames?.get(this.action)?.size ?? 1;
        if (this.frame > 0) {
          this.frame -= 1;
          this.emitter.emit('animation-update', this);
        } else if (this.loop) {
          this.frame = end;
          this.emitter.emit('animation-loop', this);
        } else {
          this.emitter.emit('animation-end', this);
        }
        this.delay = this.framerate;
        this.getFrame();
      }
    } else {
      if (this.action !== action) {
        this.frame = 0;
        this.action = action;
        this.delay = this.framerate;
        this.getFrame();
      } else if (this.delay > 0) {
        this.delay -= this.framerate;
      } else {
        if (!data.actionsFrames.get(this.action)) return;
        const end = data?.actionsFrames?.get(this.action)?.size ?? 1;
        if (this.frame + 1 < end) {
          this.frame += 1;
          this.emitter.emit('animation-update', this);
        } else if (this.loop) {
          this.frame = 0;
          this.emitter.emit('animation-loop', this)
        } else {
          this.emitter.emit('animation-end', this);
        }
        this.delay = this.framerate;
        this.getFrame();
      }
    }
  }

  public getAnimationSize() {
    const animationData = AnimationData.get(this.scene, this.animation);
    if (!animationData) return;
    const frames = animationData.actionsFrames.get(this.action);
    if (!frames) return;
    const end = frames.size;
    return end;
  }
}
