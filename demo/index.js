import { Api } from "./Api.js";
import { Config } from "./Config.js";
import { Query } from "./Query.js";
export class Index {
    constructor(config) {
        let query = new Query(window.location.search);
        this.roomCode = query.get("roomCode");
        if (!this.roomCode)
            throw new TypeError("There's no room code!!");
        Api.roomCode = this.roomCode;
        Api.baseUri = config.apiUri;
        this.init();
    }
    async init() {
        let categories = await Api.getCategories();
        if (categories.length > Index.MAX_CATEGORY_COUNT)
            categories = categories.slice(0, 3);
        let templateNode = document.getElementsByClassName("template")[0];
        this.categories = categories.map(category => this.makeCategory(templateNode, category));
        for (let category of this.categories) {
            let { textInput, sendButton, title } = category;
            textInput.addEventListener("keypress", e => this.text_keypress(category, e));
            sendButton.addEventListener("click", e => this.send_click(category, e));
            title.textContent = category.name;
            document.body.appendChild(category.container);
        }
    }
    makeCategory(templateNode, category) {
        let categoryNode = templateNode.cloneNode(true);
        categoryNode.dataset["category"] = category;
        categoryNode.className = "category";
        categoryNode.style.display = "";
        return {
            name: category,
            container: categoryNode,
            textInput: categoryNode.getElementsByClassName("textInput")[0],
            sendButton: categoryNode.getElementsByClassName("sendButton")[0],
            submitted: categoryNode.getElementsByClassName("submitted")[0],
            title: categoryNode.getElementsByClassName("title")[0]
        };
    }
    appendError(category, message) {
        let errorItem = document.createElement("div");
        errorItem.textContent = message;
        category.submitted.appendChild(errorItem);
    }
    async send_click(category, e) {
        let input = category.textInput.value;
        let newItem = document.createElement("div");
        newItem.textContent = input;
        category.submitted.appendChild(newItem);
        category.textInput.value = "";
        category.textInput.focus();
        try {
            await Api.addItems(category.name, input);
        }
        catch (err) {
            this.appendError(category, `Failed to send item ${input}; Error: ${err?.message ?? err}`);
        }
    }
    text_keypress(category, e) {
        if (e.key == "Enter")
            this.send_click(category, null);
    }
}
Index.MAX_CATEGORY_COUNT = 4;
(async () => {
    try {
        let config = await Config.getConfig();
        let index = new Index(config);
    }
    catch (err) {
        document.body.innerHTML = `Failed to initialise; Reason: ${err?.message ?? err.toString()}`;
    }
})();
