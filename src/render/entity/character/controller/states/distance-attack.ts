import { Projectile } from "../../../projectile/projectile";
import { Character } from "../../character";
import { CharacterAvatar } from "../../components/avatar";
import { CharacterMachine } from "../machine";
import { CharacterState } from "../state";
import { CharacterIdle } from "./idle";

const idleTransition = (machine : CharacterMachine, state : CharacterAttack) => {
    const avatar = machine.controller.parent.getComponent<CharacterAvatar>('avatar');
    
    if (avatar) {
        const animationSize = avatar.avatar.getAnimationSize()
       
        if (avatar.avatar.frame === 7 && state.type === 'attack-2') {
            state.throwProjectile();
        }

        if (avatar.avatar.frame === 10 && state.type === 'attack-1') {
            state.headButt();
        }

        if (state.machine.controller.parent.path?.length === 0 && avatar.avatar.frame + 1 === animationSize) {
            if (state.delayReset > 0) state.delayReset -= 1000 / 60;
            else {
                machine.setState(new CharacterIdle(machine));
                if (state.enterPosition) machine.controller.parent.setPosition(state.enterPosition.x, state.enterPosition.y);
                return true;
            }
        }
    }   
}

export class CharacterAttack extends CharacterState {
    public enterPosition : { x : number, y : number};
    public delayReset: number = 1000;
    public constructor(public machine : CharacterMachine, public target : Character, public targetData : any, public type : string) {
        super(machine);
        this.transitions.set('idle', idleTransition);
        
        const avatar = this.machine.controller.parent.getComponent<CharacterAvatar>('avatar');
        const targetAvatar = target.controller.parent.getComponent<CharacterAvatar>('avatar');

        const placeAvatar = (direction : string) => {
            if (direction === 'right' && avatar && targetAvatar) {
                avatar.avatar.image.scaleX = -1;
                targetAvatar.avatar.image.scaleX = 1;
                return -1;
            } else if (direction === 'left' && avatar && targetAvatar) {
                avatar.avatar.image.scaleX = 1;
                targetAvatar.avatar.image.scaleX = -1;
                return 1;
            }
            return 0;
        }
        
        if (avatar && targetAvatar) {
            let position = 1;
            if (target.x < machine.controller.parent.x) {
                if (target.x + 1 < 30) {
                    position = placeAvatar('right');
                } else {
                    position = placeAvatar('left');
                } 
            } else {
                if (target.x - 1 > 0) {
                    position = placeAvatar('left');
                } else {
                    position = placeAvatar('right');
                }
            }

            if (type === 'attack-1') {
                this.enterPosition = { x : machine.controller.parent.x, y : machine.controller.parent.y};
                if (position === 1) {
                    machine.controller.parent.setPosition(target.x - 1, target.y);
                } else {
                    machine.controller.parent.setPosition(target.x + 1, target.y);
                }
            }
        }
    }
    public attacked: boolean = false;
    public throwProjectile() : void {
        if (this.attacked) return;
        this.attacked = true;
        console.log('throw projectile');
        const { scene, container, entityData } = this.machine.controller.parent;
        const projectile = new Projectile(scene, (container?.x as any) + 15, (container as any).y - 15, entityData.team);
       
        (projectile.container as any).setDepth(200);
        scene.tweens.add({
            targets: [projectile.container],
            x : (this.target.container?.x as any) + 15,
            y : (this.target.container?.y as any) - 15,
            duration: 600,
            ease: Phaser.Math.Easing.Cubic,
            onUpdate: () => {

            },
            onComplete: () => {
                projectile?.destroy();
                this.target.entityData = this.targetData;
                this.machine.setState(new CharacterIdle(this.machine));
                this.target.damage(this.targetData.health, this.machine.controller.parent.entityData.team);
            
            }
        })
    }

    public headButt() : void {
        if (this.attacked) return;
        this.attacked = true;
        this.target.entityData = this.targetData;
        this.target.damage(this.targetData.health, this.machine.controller.parent.entityData.team);
    }

    public enter(): void {
        const avatar = this.machine.controller.parent.getComponent<CharacterAvatar>('avatar');
        if (avatar) {
            let attack1 = this.machine.controller.parent.entityData.team === 'virus' ? 'coup-virus' : 'coup-de-boule';
            avatar.avatar.playActionByName(this.type === 'attack-2' ? 'lancer' : attack1, false);
        }
    }

    public leave(): void {
    
    }
}