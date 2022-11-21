export const gameText : Record<string, any> = {
    french : {
        welcomeText: "Bonjour, bienvenue!",
        gameOverText: "Vous avez perdu"
    },
    english: {
        welcomeText: "Hi, welcome!",
        gameOverText: "You lose!"
    }
}

let languageChoisi = "french";

console.log(gameText[languageChoisi].welcomeText);