import { Character } from "../character/character";
import { Entity, EntityScene } from "../entity";
import { BoardController } from "./components/controller";
import { Grid } from "./components/grid";

export class Board extends Entity {
    public action: string = 'deplacement';
    public character: Character;

    public constructor(
        public scene : EntityScene, 
        public width : number, 
        public height : number, 
        public cellWidth : number,
        public cellHeight : number
    ) {
        super();
        this.initContainer(0, 0);
    }

    protected initComponents(): void {
        this.addComponent('grid', new Grid(this));
        this.addComponent('controller', new BoardController(this));
    }

    public update(): void {
        if (this.character) {
            this.action = this.character.entityData.currentAction;
        }
        super.update();
    }

    public highlightCells(color : number, x : number, y : number, schema : string[], localTeam :boolean) {
        const grid = this.getComponent<Grid>('grid');
        grid?.highlight(color, x, y, schema, localTeam);
    }

    public setCharacterTurn(character : Character) {
        this.character = character;
        this.action = 'deplacement';
    }

    public setAction(action : string) {
        this.action = action;
    }
}