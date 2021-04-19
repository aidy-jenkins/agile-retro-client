import { Api } from "./Api.js";
import { Config } from "./Config.js";
import { Query } from "./Query.js";

interface Category {
    container: HTMLDivElement;
    name: string;
    sendButton: HTMLInputElement;
    textInput: HTMLInputElement;
    submitted: HTMLDivElement;
}

export class Index {

    static readonly MAX_CATEGORY_COUNT = 4;

    categories: Category[];
    roomCode: string;
    
    constructor(config: Config.ClientConfig) {
        let query = new Query(window.location.search);
        this.roomCode = query.get("roomCode");
        if(!this.roomCode)
            throw new TypeError("There's no room code!!");

        Api.roomCode = this.roomCode;
        Api.baseUri = config.apiUri;

        this.init();
    }

    async init() {
        let categories = await Api.getCategories();
        if(categories.length > Index.MAX_CATEGORY_COUNT)
            categories = categories.slice(0, 3);

        let templateNode = document.getElementsByClassName("template")[0] as HTMLDivElement;
        this.categories = categories.map(category => this.makeCategory(templateNode, category));

        for(let category of this.categories) {
            let {textInput, sendButton} = category;

            textInput.addEventListener("keypress", e => this.text_keypress(category, e));
            sendButton.addEventListener("click", e => this.send_click(category, e));

            document.body.appendChild(category.container);
        }
    }

    private makeCategory(templateNode: HTMLDivElement, category: string) {
        let categoryNode = templateNode.cloneNode(true) as HTMLDivElement;
        categoryNode.dataset["category"] = category;
        categoryNode.className = "category";
        categoryNode.style.display = "";
        return {
            name: category,
            container: categoryNode,
            textInput: categoryNode.getElementsByClassName("textInput")[0] as HTMLInputElement,
            sendButton: categoryNode.getElementsByClassName("sendButton")[0] as HTMLInputElement,
            submitted: categoryNode.getElementsByClassName("submitted")[0] as HTMLDivElement
        } as Category;
    }

    private appendError(category: Category, message: string) {
        let errorItem = document.createElement("div");
        errorItem.textContent = message;
        category.submitted.appendChild(errorItem);
    }

    private async send_click(category: Category, e: MouseEvent) {
        let input = category.textInput.value;
        
        let newItem = document.createElement("div");
        newItem.textContent = input;
        category.submitted.appendChild(newItem);
        
        category.textInput.value = "";
        category.textInput.focus();

        try {
            await Api.addItems("default", input);
        }
        catch(err) {
            this.appendError(category, `Failed to send item ${input}; Error: ${err?.message ?? err}`);
        }
    }

    private text_keypress(category: Category, e: KeyboardEvent) {
        if(e.key == "Enter")
            this.send_click(category, null);
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
