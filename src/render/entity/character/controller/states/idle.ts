import { Grid } from "../../../board/components/grid";
import { CharacterAvatar } from "../../components/avatar";
import { CharacterMachine } from "../machine";
import { CharacterState } from "../state";
import { CharacterRunning } from "./running";

const runningTransition = (machine : CharacterMachine, state : CharacterIdle) => {
    if (state.machine.controller.parent.path?.length > 0) {
        machine.setState(new CharacterRunning(machine));
        return true;
    }
}

export class CharacterIdle extends CharacterState {
    public constructor(public machine : CharacterMachine) {
        super(machine);
        this.transitions.set('running', runningTransition);
    }

    public enter(): void {
        const avatar = this.machine.controller.parent.getComponent<CharacterAvatar>('avatar');
        if (avatar) {
            avatar.avatar.playActionByName('respire');
        }
    }
}