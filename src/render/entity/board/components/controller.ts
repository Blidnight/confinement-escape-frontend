import { CharacterController } from "../../character/controller/controller";
import { CharacterMachine } from "../../character/controller/machine";
import { CharacterIdle } from "../../character/controller/states/idle";
import { EntityComponent } from "../../entity";
import { Board } from "../board";
import { Grid } from "./grid";

export class BoardController extends EntityComponent {
    public constructor(public parent : Board) {
        super();
    }

    public enter() : void {

    }

    public update(): void {
        const { character , action } = this.parent;
        const grid = this.parent.getComponent<Grid>('grid');

        if (!grid) return;
        if (!character) return;

        const characterController = character.getComponent<CharacterController>('controller');
        if (!characterController) return;

        const characterMachine = characterController.machine;
        console.log(action)
        if (character.playing && characterMachine.state instanceof CharacterIdle) {
            const actionName = action === 'deplacement' ? action + '-' + character.entityData.movement : action;
            const schema = Grid.schemas.get(actionName);   
            
            if (schema) {
                const cellColor = actionName.includes('deplacement') ? 0x00FF00 : 0xFF0000;
                grid.highlight(cellColor, character.x, character.y, schema, character.localTeam);
            } else {
                grid.resetCells();
            }
        } else if (grid.highlightedCells.size > 0) {
            grid.resetCells();
        }
    }
}