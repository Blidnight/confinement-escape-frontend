import { AnimationObject } from "../../../animation/animation";
import { EntityComponent } from "../../entity";
import { Character } from "../character";

export class CharacterAvatar extends EntityComponent {
    public avatar : AnimationObject;
    public constructor(public parent : Character) {
        super();
    }

    public awake(): void {
        const { scene, container, texture } = this.parent;
        this.avatar = new AnimationObject(scene, texture, 15, 20);
        this.avatar.framerate = 1/60;
        container?.add(this.avatar.image);
        this.avatar.playActionByName('respire');
    }
}