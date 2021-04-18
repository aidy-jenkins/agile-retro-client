import { Api } from "./Api.js";

export class Index {
    textInput = document.getElementById("textInput") as HTMLInputElement;
    sendButton = document.getElementById("sendButton") as HTMLInputElement;
    submitted = document.getElementsByClassName("submitted")[0] as HTMLDivElement;

    constructor() {
        this.sendButton.addEventListener("click", e => this.send_click(e));
        this.textInput.addEventListener("keypress", e => this.text_keypress(e));
        Api.baseUri = "https://localhost:5001";
    }

    send_click(e: MouseEvent) {
        let newItem = document.createElement("div");
        newItem.textContent = this.textInput.value;
        this.textInput.value = "";
        this.submitted.appendChild(newItem);
        this.textInput.focus();
    }

    text_keypress(e: KeyboardEvent) {
        if(e.key == "Enter")
            this.send_click(null);
    }
}

new Index();