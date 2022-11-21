import Phaser from 'phaser';
import { EntityComponent } from "../../entity";
import { Board } from "../board";

export class Grid extends EntityComponent {
    public static schemas : Map<string, string[]> = new Map();

    public cells : Map<string, Phaser.GameObjects.Rectangle>;
    public highlightedCells: Set<Phaser.GameObjects.Rectangle>;

    public constructor(public parent : Board) {
        super();
    }

    public createBoard() : void {
        const { scene, container, width, height, cellWidth, cellHeight } = this.parent;
        this.cells = new Map();
        this.highlightedCells = new Set();
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const cellKey = x + '-' + y;
                const cell = scene.add.rectangle(x * cellWidth, y * cellHeight, cellWidth, cellHeight, 0xEFEFEF, 1);
                cell.setStrokeStyle(1, 0xCCCCCC);
                cell.setOrigin(0);

                cell.setInteractive();
                cell.on('pointerdown', () => {
                    if (this.highlightedCells?.has(cell)) {
                        scene.game.events.emit('cell-action', x, y, this.parent.action);
                    }
                })
                
                this.cells.set(cellKey, cell);
                container?.add(cell);
            }
        }
        container?.setDepth(0);
    }

    public resetCells() {
        this.highlightedCells?.forEach(cell => cell.setFillStyle(0xEFEFEF).setAlpha(1));
        this.highlightedCells = new Set();
    }

    highlight(color : number, x : number, y : number, schema : string[], localTeam : boolean = true) {
        this.resetCells();
        let offsetX : number = 0, offsetY : number = 0;
        for (let i = 0; i < schema.length; i += 1) {
            let row = schema[i];
            let centerIndex = row.indexOf('.');

            if (centerIndex !== -1) {
                offsetX = centerIndex;
                offsetY = i;
            }
        }
        x -= offsetX;
        y -= offsetY;
        
        for(let i = 0; i < schema.length; i += 1) {
            Array.from(schema[i]).forEach((value, j) => {
                let cellX = x + j;
                let cellY = y + i;
                let cell = this.cells.get(cellX + '-' + cellY)
                if (value === '1' && cell) {
                    cell.setFillStyle(color);
                    this.highlightedCells.add(cell);
                    if (!localTeam) {
                        cell.setAlpha(0.3)
                    }
                }
            })
        }
    }

    public awake(): void {
        this.createBoard();
        (window as any).grid = this;
    }
}

Grid.schemas.set('deplacement-3', [
    '0001000',
    '0011100',
    '0111110',
    '111.111',
    '0111110',
    '0011100',
    '0001000'
]);

Grid.schemas.set('deplacement-2', [
    '00100',
    '01110',
    '11.11',
    '01110',
    '00100'
]);

Grid.schemas.set('deplacement-1', [
    '010',
    '1.1',
    '010'
]);

Grid.schemas.set('attack-1', [
    '010',
    '1.1',
    '010'
]);

Grid.schemas.set('attack-2', [
    '10001',
    '01010',
    '00.00',
    '01010',
    '10001'
]);