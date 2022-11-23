import EventEmitter from "events";
import { AnimationLoader } from "../animation/loader";

export class LoadingScene extends Phaser.Scene {
    public entity: Phaser.GameObjects.Group;
    
    constructor() {
        super('loading-scene');
    }

    public preload() {
        this.load.atlas('decors', '/assets/decors/atlas.png', '/assets/decors/atlas.json')
        this.load.atlas('projectile', '/assets/projectile/atlas.png', '/assets/projectile/atlas.json')
        this.load.image('character-pointer', '/interface/tooltips/bulle-triangle.png');
        AnimationLoader.reset();
    }
    public async create() {
        console.log('loading-scene');
        this.add.rectangle(0, 0, 900, 600, 0x000000).setOrigin(0);
        this.add.text(450, 300, "Loading...").setOrigin(0.5);
        await Promise.all([
            'citoyen-1',
            'citoyen-2',
            'citoyen-3',
            'policier-1',
            'policier-2',
            'policier-3',
            'virus'
        ].map(t => this.loadAnimation(t)));
        this.game.events.emit('assets-ready');
        this.scene.start('game-scene')
    }
    public async loadAnimation(animationName : string) {
        return new Promise((res) => {
            const e = AnimationLoader.loadAnimation(this, animationName) as EventEmitter;
            if (typeof e !== 'boolean') {
                e.on('complete', () => {
                    res(true);
                })
            } else res(true);
        })
    }
}