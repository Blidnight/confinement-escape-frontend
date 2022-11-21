import { EntityComponent } from "../../entity";
import { Projectile } from "../projectile";

const projectiles : Record<string, string[]> = {
    civilian : ['tv', 'beignets', 'chaussure', 'canette', 'bouteille'], 
    police: ['taser', 'baton-policier']
}

export class ProjectileTexture extends EntityComponent {
    public constructor(public parent : Projectile) {
        super();
    }

    start() {
        const { scene, container, team } = this.parent;
        const projectile = projectiles[team][Math.floor(
            Math.random() * projectiles[team].length
        )];
        const texture = scene.add.image(0, 0, 'projectile', projectile);
        container?.add(texture);

        scene.tweens.add({
            targets : [texture],
            angle : 360,
            repeat : -1,
            duration : 600
        });
    }
}