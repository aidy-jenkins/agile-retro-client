export var Api;
(function (Api) {
    Api.baseUri = null;
    Api.roomCode = null;
    async function addItems(category, ...items) {
        let response = await sendRequest(`${Api.baseUri}/room/${Api.roomCode}/category/${category}/items`, "POST", { items });
        if (!response.ok)
            throw new TypeError("Failed to add items");
    }
    Api.addItems = addItems;
    async function getCategories() {
        let response = await sendRequest(`${Api.baseUri}/room/${Api.roomCode}/categories`, "GET");
        if (!response.ok)
            throw new TypeError("Failed to fetch categories");
        return (await response.json());
    }
    Api.getCategories = getCategories;
    async function getItems(category) {
        let response = await sendRequest(`${Api.baseUri}/room/${Api.roomCode}/category/${category}/items`, "GET");
        if (!response.ok)
            throw new TypeError("Failed to fetch items");
        return (await response.json());
    }
    Api.getItems = getItems;
    async function sendRequest(uri, method, payload) {
        return await fetch(uri, {
            method,
            body: JSON.stringify(payload),
            headers: [
                [
                    "Content-Type", "application/json"
                ]
            ]
        });
    }
})(Api || (Api = {}));
