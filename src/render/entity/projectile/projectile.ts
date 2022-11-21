import { Entity, EntityScene } from "../entity";
import { ProjectileTexture } from "./components/texture";

export class Projectile extends Entity {
    public constructor(public scene : EntityScene, public x : number, public y : number, public team : string) {
        super();
        this.initContainer(x, y);
    }

    protected initComponents(): void {
        this.addComponent('texture', new ProjectileTexture(this));
    }
}