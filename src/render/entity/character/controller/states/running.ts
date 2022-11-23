import { CharacterAvatar } from "../../components/avatar";
import { CharacterMachine } from "../machine";
import { CharacterState } from "../state";
import { CharacterIdle } from "./idle";

const idleTransition = (machine : CharacterMachine, state : CharacterRunning) => {
    const avatar = machine.controller.parent.getComponent<CharacterAvatar>('avatar');
    
    if (avatar) {
        const animationSize = avatar.avatar.getAnimationSize()
        if (state.machine.controller.parent.path?.length === 0 && avatar.avatar.frame + 1 === animationSize) {
            machine.setState(new CharacterIdle(machine));
            return true;
        }
    }   
}

export class CharacterRunning extends CharacterState {
    public tween : Phaser.Tweens.Tween;
    public constructor(public machine : CharacterMachine) {
        super(machine);
        this.transitions.set('idle', idleTransition);
    }

    public startWalk() : void {
        const { parent } = this.machine.controller;
        const { scene, container, path } = parent;
        const avatar = parent.getComponent<CharacterAvatar>('avatar');

        let targetPosition = path[0];
        if (!targetPosition) return;
        if (!avatar) return;

        if (parent.x !== targetPosition[0]) {
            if (parent.x > targetPosition[0]) {
                avatar.avatar.image.scaleX = -1;
            } else {
                avatar.avatar.image.scaleX = 1;
            }
        }

        this.tween = scene.tweens.add({
            targets: [container],
            x : targetPosition[0] * 30,
            y : targetPosition[1] * 30,
            duration : 400,
            onUpdate: () => {
                parent.container?.setDepth(
                    parent.container.y * 900 +
                    parent.container.x 
                );
            },
            onComplete : () => {
                parent.x = targetPosition[0];
                parent.y = targetPosition[1];
                path.shift();
                this.startWalk();
            }
        })
    }

    public enter(): void {
        const avatar = this.machine.controller.parent.getComponent<CharacterAvatar>('avatar');
        if (avatar) {
            avatar.avatar.playActionByName('marche');
            this.machine.controller.parent.path.shift();
            this.startWalk();
        }
    }
}
