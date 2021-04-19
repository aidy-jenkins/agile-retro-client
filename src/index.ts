import { Api } from "./Api.js";
import { Config } from "./Config.js";
import { Query } from "./Query.js";

export class Index {
    textInput = document.getElementById("textInput") as HTMLInputElement;
    sendButton = document.getElementById("sendButton") as HTMLInputElement;
    submitted = document.getElementsByClassName("submitted")[0] as HTMLDivElement;
    roomCode: string;
    
    constructor(config: Config.ClientConfig) {
        this.sendButton.addEventListener("click", e => this.send_click(e));
        this.textInput.addEventListener("keypress", e => this.text_keypress(e));

        let query = new Query(window.location.search);
        this.roomCode = query.get("roomCode");
        if(!this.roomCode)
            throw new TypeError("There's no room code!!");

        Api.roomCode = this.roomCode;
        Api.baseUri = config.apiUri;
    }

    appendError(message: string) {
        let errorItem = document.createElement("div");
        errorItem.textContent = message;
        this.submitted.appendChild(errorItem);
    }

    async send_click(e: MouseEvent) {
        let input = this.textInput.value;
        
        let newItem = document.createElement("div");
        newItem.textContent = input;
        this.submitted.appendChild(newItem);
        
        this.textInput.value = "";
        this.textInput.focus();

        try {
            await Api.addItems("default", input);
        }
        catch(err) {
            this.appendError(`Failed to send item ${input}; Error: ${err?.message ?? err}`);
        }
    }

    text_keypress(e: KeyboardEvent) {
        if(e.key == "Enter")
            this.send_click(null);
    }
}

(async() => {
    try {
        let config = await Config.getConfig();
        let index = new Index(config);
    }
    catch(err) {
        document.body.innerHTML = `Failed to initialise; Reason: ${err?.message ?? err.toString()}`;
    }

})();
