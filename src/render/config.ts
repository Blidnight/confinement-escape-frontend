import Phaser from 'phaser';
import { GameScene } from './scene/game-scene';
import { LoadingScene } from './scene/loading-scene';

export const config = {
    width : 900,
    height : 600,
    scene : [LoadingScene,GameScene]
}