import { EntityComponent } from "../../entity";
import { Character } from "../character";
import { CharacterAvatar } from "./avatar";

export class CharacterHud extends EntityComponent {
    public container : Phaser.GameObjects.Container;
    public pointer : Phaser.GameObjects.Image;
    public healthBar : Map<string, Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = new Map();
    public constructor(public parent : Character) {
        super();
    }

    public createHealthBar() : void {
        const { scene } = this.parent;
        const healthBar = scene.add.container(0, 0);
        const background = scene.add.rectangle(-20, -5, 40, 10, 0x353535, 1).setOrigin(0);
        const progressBar = scene.add.rectangle(-20, -5, 40, 10, 0x92100f, 1).setOrigin(0);
        const indicator = scene.add.text(0, 0, '10', {
            fontSize: '7px',
            fontFamily: 'Open Sans',
            color: 'white'
        }).setOrigin(0.5).setResolution(1.9);

        healthBar.add([background, progressBar, indicator]);

        this.healthBar.set('background', background);
        this.healthBar.set('progressBar', progressBar);
        this.healthBar.set('indicator', indicator);

        this.container.add(healthBar);
    }

    public createFocusArrow() : void {

    }

    public start(): void {
        const { scene, container } = this.parent;
        const avatar = this.parent.getComponent<CharacterAvatar>('avatar');
        const avatarHeight = avatar?.avatar.image.height ?? 55;
        this.container = scene.add.container(15, -(avatarHeight - 10));
        this.pointer = scene.add.image(0, -10, 'character-pointer').setOrigin(0.5, 1);
        this.container.add(this.pointer);
        this.createHealthBar();
        // create the FocusArrow
        // in the update check the playing property on parent
        // and apply the outline shader to the container if the 
        // player is currently playing
        // use entityData to get live information of character lifes
        container?.add(this.container);
        (window as any).player = this;
    }

    public getProgressWidth(value : number, maxWidth: number) : number {
        return value * maxWidth / this.parent.entityData.maxHealth;
    }

    public update(): void {
        // update the indicator text
        const healthText = this.healthBar.get('indicator') as Phaser.GameObjects.Text;
        const healthBar = this.healthBar.get('progressBar') as Phaser.GameObjects.Rectangle;
        const background = this.healthBar.get('background') as Phaser.GameObjects.Rectangle;
        if (healthText !== undefined && healthBar !== undefined) {
            healthText.setText(this.parent.entityData.health.toString());
            healthBar.width = this.getProgressWidth(this.parent.entityData.health, background.width);
        }
        // update the progressBar width using the health value in parent.getHealth()

        // Hide the pointer when we're not playing
        if (this.parent.playing && !this.pointer.visible) {
            this.pointer.setVisible(true);
        } else if (!this.parent.playing && this.pointer.visible) {
            this.pointer.setVisible(false);
        }
    }
}