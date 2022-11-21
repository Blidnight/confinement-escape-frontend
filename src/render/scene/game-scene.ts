import EventEmitter from 'events';
import Phaser from 'phaser';
import { AnimationLoader } from '../animation/loader';
import { Board } from '../entity/board/board';
import { Character } from '../entity/character/character';
import { Projectile } from '../entity/projectile/projectile';

export class GameScene extends Phaser.Scene {
    public entity: Phaser.GameObjects.Group;
    
    constructor() {
        super('game-scene');
    }

    public create() {
        console.log('start game-scene');
        const width = 900 / 30;
        const height = 600 / 30;

        this.add.rectangle(0, 0, 900, 600, 0xEFEFEF, 1).setOrigin(0);
        this.entity = this.add.group();
        this.entity.runChildUpdate = true;

        let board: Board = new Board(this, width, height, 30, 30);
        let characters : Character[] = [];
        let localTeam : string = 'spectator';

        // console.log(board);
        // const character = new Character(this, board, 120, 120, 'citoyen-1')
        // character.setPosition(10, 5)

        // const character2 = new Character(this, board, 120, 150, 'policier-3')
        // character2.setPosition(5, 6);
        // character2.entityData.team = 'police';

        // const attackButton = this.add.rectangle(200, 120, 40, 40, 0xFF0000).setOrigin(0);
        // attackButton.setInteractive();
        // attackButton.on('pointerdown', () => {
        //     console.log({...character.entityData, health : character.entityData.health - 1})
        //     character2.attack(character, {...character.entityData, health : character.entityData.health - 1}, 'attack-2')
        // });
        // return;

        const ON_GAME_STATE = (data : any) => {

            data.obstacles.forEach((obstacle : any) => {
                let offsetX = obstacle.avatar.includes('immeuble') ? 0 : 15;
                const o = this.add.image(obstacle.x * 30 + offsetX, obstacle.y * 30 + 30, 'decors', obstacle.avatar + ".png")
                o.setDepth(obstacle.y * 900 + 30 + obstacle.x * 30 + offsetX );
            })

            data.entities.forEach((e : any) => {
                const character = new Character(this, board, e.x, e.y, e.avatar);
                character.setId(e.id ?? '-');
                character.setPosition(e.x, e.y)
                character.entityData = e;
                character.localTeam = e.team === localTeam;
                console.log(e.team, localTeam);
                character.container?.setDepth(e.y * 900 + e.x * 30);
                characters.push(character);
            })
        };

        const ON_GAME_TEAM = (team : string) => {
            localTeam = team;
            characters.forEach(c => {
                c.localTeam = c.entityData.team === localTeam;
            })
        }

        const ON_GAME_ENTITIES = (entities : any) => {
            console.log(entities);
            characters = characters.filter(e => e.entityData.health > 0);
            const newEntities = entities.filter((e : any) => !characters.find(a => a.getId() === e.id ));
            newEntities.forEach((e : any) => {
                const character = new Character(this, board, e.x, e.y, e.avatar);
                character.setId(e.id ?? '-');
                character.setPosition(e.x, e.y)
                character.entityData = e;
                character.localTeam = e.team === localTeam;
                console.log(e.team, localTeam);
                character.container?.setDepth(e.y * 900 + e.x * 30);
                characters.push(character);
            })
        };

        const ON_GAME_TURN = (turn : any, a : string) => {
            const entity = characters.find(e => e.getId() === turn.id);
            if (entity) {
                characters.forEach(c => c.setPlaying(false));
                entity.setPlaying(true);
                entity.entityData = turn;
                board.setCharacterTurn(entity);
            }    
        };

        const ON_GAME_TURN_ACTION = (data : any) => {
            board.setAction(data.action);
        };

        const ON_TURN_UPDATE = (data : any) => {
            console.log('turn update', 'window', window.document.hidden);
            const entity = characters.find(e => e.getId() === data.entity.id);
            if (data.action === 'movement' && entity) {
                if (!window.document.hidden) entity.setPath(data.path);
                else {
                    let lastSpot = data.path[data.path.length - 1];
                    console.log(lastSpot);
                    entity.setPosition(lastSpot[0], lastSpot[1]);
                }
                entity.entityData = data.entity;
            }
            if (data.action === 'attack-2' && entity) {
                const targetEntity =  characters.find(e => e.getId() === data.target.id);
                if (targetEntity) {
                    if (!window.document.hidden) {
                        entity.attack(targetEntity, data.target, 'attack-2');
                    } else {
                        targetEntity.entityData = data.target;
                        if (data.target.health <= 0) targetEntity.destroy();
                    }
                }
                entity.entityData = data.entity;
            }

            if (data.action === 'attack-1' && entity) {
                const targetEntity =  characters.find(e => e.getId() === data.target.id);
                if (targetEntity) {
                    if (!window.document.hidden) {
                        entity.attack(targetEntity, data.target, 'attack-1');
                    } else {
                        targetEntity.entityData = data.target;
                        if (data.target.health <= 0) targetEntity.destroy();
                    }
                }
                entity.entityData = data.entity;
            }
        };

        this.game.events.on('game-state', ON_GAME_STATE);
        this.game.events.on('game-team', ON_GAME_TEAM);
        this.game.events.on('game-entities', ON_GAME_ENTITIES)
        this.game.events.on('game-turn', ON_GAME_TURN);
        this.game.events.on('turn-action', ON_GAME_TURN_ACTION);
        this.game.events.on('turn-update', ON_TURN_UPDATE)

        this.game.events.once('game-reset', () => {
            this.game.events.off('game-state', ON_GAME_STATE);
            this.game.events.off('game-team', ON_GAME_STATE);
            this.game.events.off('game-entities', ON_GAME_ENTITIES)
            this.game.events.off('game-turn', ON_GAME_TURN);
            this.game.events.off('turn-action', ON_GAME_TURN_ACTION);
            this.game.events.off('turn-update', ON_TURN_UPDATE);

            this.scene.start('game-scene');
        })
        
        // const character = new Character(this, board, 120, 120, 'citoyen-1')
        // character.setPosition(10, 5)

        // const character2 = new Character(this, board, 120, 150, 'policier-3')
        // character2.setPosition(5, 6);
        // character2.entityData.team = 'police';

        // const attackButton = this.add.rectangle(200, 120, 40, 40, 0xFF0000).setOrigin(0);
        // attackButton.setInteractive();
        // attackButton.on('pointerdown', () => {
        //     console.log({...character.entityData, health : character.entityData.health - 1})
        //     character2.attack(character, {...character.entityData, health : character.entityData.health - 1}, 'attack-2')
        // });
        // animation.emitter.once('animation-end', () => {
        //     animation.playAction(0, false);
        // })
        // console.log(animation);
    }

    update(time: number, delta: number): void {
        this.scale.updateBounds();
    }
}