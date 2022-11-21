import { Machine } from "../../machine";
import { CharacterController } from "./controller";
import { CharacterIdle } from "./states/idle";

export class CharacterMachine extends Machine {
    public constructor(public controller : CharacterController) {
        super();
        this.setState(new CharacterIdle(this));
    }

    update() {
        this.state?.update();
    }
}