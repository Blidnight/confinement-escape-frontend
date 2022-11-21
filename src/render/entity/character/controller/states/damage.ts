import { CharacterAvatar } from "../../components/avatar";
import { CharacterMachine } from "../machine";
import { CharacterState } from "../state";
import { CharacterIdle } from "./idle";

const idleTransition = (machine : CharacterMachine, state : CharacterDamage) => {
    const avatar = machine.controller.parent.getComponent<CharacterAvatar>('avatar');
    
    if (avatar) {
        const animationSize = avatar.avatar.getAnimationSize()

        if (state.machine.controller.parent.path?.length === 0 && avatar.avatar.frame + 1 === animationSize) {
            if (state.health > 0) {
                machine.setState(new CharacterIdle(machine));
            } else {
                machine.controller.parent.destroy();
            } 
            return true;
        }
    }   
}


export class CharacterDamage extends CharacterState {
    public constructor(public machine : CharacterMachine, public health : number, public team : string) {
        super(machine);
        this.transitions.set('idle', idleTransition);
    }

    public enter(): void {
        const avatar = this.machine.controller.parent.getComponent<CharacterAvatar>('avatar');
        if (avatar) {
            let damageAnim = this.team === 'virus' ? 'coup-virus' : 'coup-subit';
            avatar.avatar.playActionByName(this.health > 0 ? damageAnim : 'battu');
        }
    }
}