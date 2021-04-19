import { Api } from "./Api.js";
import { Config } from "./Config.js";
import { Query } from "./Query.js";
import { linqWrapper } from "./linq.js";

const weightFactor = 75;

export class Wordcloud {
    roomCode: string;
    category: string;
    cloudCanvas: HTMLCanvasElement;
    
    constructor(config: Config.ClientConfig) {
        let cloudCanvas = this.cloudCanvas = document.getElementById("cloudCanvas") as HTMLCanvasElement;
        let canvasStyle = window.getComputedStyle(cloudCanvas);
        cloudCanvas.width = parseInt(canvasStyle.width);
        cloudCanvas.height = parseInt(canvasStyle.height);

        let query = new Query(window.location.search);
        this.roomCode = query.get("roomCode");
        if(!this.roomCode)
            throw new TypeError("There's no room code!!");

        this.category = query.get("category");
        if(!this.category)
            throw new TypeError("There's no category!!");
        
        Api.baseUri = config.apiUri;
        Api.roomCode = this.roomCode;

        this.init();
    }

    async init() {
        let items = await Api.getItems(this.category);
        this.drawWordcloud(items);
    }

    drawWordcloud(items: string[]) {
        let lItems = linqWrapper.linq(items);
        let distinctItems = lItems.distinct();
        let cloudItems = distinctItems.select(item => [item, lItems.count(y => y === item)]);

        (window as any).WordCloud(this.cloudCanvas, { 
            list: cloudItems.toArray(),
            weightFactor
        });
    }

    appendError(message: string) {
        let errorItem = document.createElement("div");
        errorItem.textContent = message;
        document.body.appendChild(errorItem);
    }

}

(async() => {
    try {
        let config = await Config.getConfig();
        let wordcloud = new Wordcloud(config);
    }
    catch(err) {
        document.body.innerHTML = `Failed to initialise; Reason: ${err?.message ?? err.toString()}`;
    }

})();