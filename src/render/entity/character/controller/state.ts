import { State } from "../../state";
import { CharacterMachine } from "./machine";

export class CharacterState extends State {
    public constructor(public machine : CharacterMachine) {
        super(machine);
    }
}