import { Board } from "../board/board";
import { Entity, EntityScene } from "../entity";
import { CharacterAvatar } from "./components/avatar";
import { CharacterHud } from "./components/hud";
import { CharacterController } from "./controller/controller";
import { CharacterDamage } from "./controller/states/damage";
import { CharacterAttack } from "./controller/states/distance-attack";

export class Character extends Entity {
    private _id: string;
    
    public path: [number, number][] = [];
    public entityData : { maxHealth : number, health : number, movement: number, team: string, currentAction: string, [key : string] : any} = {maxHealth : 10, health : 10, movement : 3, team : 'civilian', currentAction: 'deplacement'};
    public playing : boolean = false;
    public localTeam : boolean = false;
    public controller : CharacterController;

    public constructor(public scene : EntityScene, public board : Board, public x : number, public y : number, public texture : string) {
        super();
        this.initContainer(x * board.cellWidth, y * board.cellHeight);
    }

    protected initComponents(): void {
        this.controller = new CharacterController(this);
        this.addComponent('avatar', new CharacterAvatar(this));
        this.addComponent('controller', this.controller);
        this.addComponent('hud', new CharacterHud(this));
    }

    public setId(id : string) {
        this._id = id;
    }

    public getId() {
        return this._id;
    }

    public setPosition(x : number, y : number) {
        this.x = x;
        this.y = y;
        if (this.container) {
            this.container.x = x * this.board.cellWidth;
            this.container.y = y * this.board.cellHeight;
            this.container.setDepth(y * 900 + x * 30 + 15);
        }   
    }

    public attack(target : Character, targetData : any, type: string) {
        if (this.controller.machine.state instanceof CharacterAttack) return;
        this.controller.machine.setState(new CharacterAttack(this.controller.machine, target, targetData, type));
    }

    public damage(health : number, team : string) {
        if(this.controller.machine.state instanceof CharacterDamage) return;
        this.controller.machine.setState(new CharacterDamage(this.controller.machine, health, team));
    }

    public setPath(path : [number, number][]) {
        this.path = path;
    }

    public getHealth() {
        return this.entityData?.health ?? 0;
    }

    public setPlaying(playing : boolean) {
        this.playing = playing;
    }
}