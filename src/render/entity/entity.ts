export type EntityScene = Phaser.Scene & { entity: Phaser.GameObjects.Group };

export abstract class EntityComponent {
  public awake(): void {}
  public start(): void {}
  public update(): void {}
  public lateUpdate(): void {}
  public destroy(): void {}
}

export class Entity {
  public scene: EntityScene;
  public container: Phaser.GameObjects.Container | undefined;
  public x : number;
  public y : number;

  protected _components: Map<string, EntityComponent> = new Map();

  protected initComponents() {}
  protected initContainer(x : number, y : number, update?: Function) {
    this.container = this.scene.add.container(x, y);
    this.container.update = () => {
        update?.bind(this);
        update?.();
        this.update();
    }
    this.initComponents();
    this.awake();
    this.start();
    this.scene.entity.add(this.container);
  }

  public awake() {
    this._components.forEach((component) => component.awake());
  }

  public start() {
    this._components.forEach((component) => component.start());
  }

  public update() {
    this._components.forEach((component) => component.update());

    this.lateUpdate();
  }

  public lateUpdate() {
    this._components.forEach((component) => component.lateUpdate());
  }

  public destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
    this._components.forEach((component) => component.destroy());
  }

  public addComponent<T extends EntityComponent>(
    name: string,
    component: T
  ): Entity {
    this._components.set(name, component);
    return this;
  }

  public getComponent<T extends EntityComponent>(name: string): T | undefined {
    return this._components.get(name) as T | undefined;
  }

  public removeComponent(name: string): Entity {
    const component = this._components.get(name);
    if (component) {
      this._components.delete(name);
      component.destroy();
    }
    return this;
  }
}