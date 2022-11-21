import { EntityComponent } from "../../entity";
import { Character } from "../character";
import { CharacterMachine } from "./machine";

export class CharacterController extends EntityComponent {
    public machine: CharacterMachine;
    public constructor(public parent : Character) {
        super();
    }

    public start(): void {
        this.machine = new CharacterMachine(this);
    }

    public update(): void {
        this.machine.update();
    }
}