export module Api {
    export let baseUri = null as string;
    export let roomCode = null as string;

    export async function addItems(category: string, ...items: string[]) {
        let response = await sendRequest(`${baseUri}/room/${roomCode}/category/${category}/items`, "POST", { items })
        if(!response.ok)
            throw new TypeError("Failed to add items");
    }

    export async function getCategories() {
        let response = await sendRequest(`${baseUri}/room/${roomCode}/categories`, "GET")
        if(!response.ok)
            throw new TypeError("Failed to fetch categories");
        return (await response.json()) as string[];
    }

    export async function getItems(category: string) {
        let response = await sendRequest(`${baseUri}/room/${roomCode}/category/${category}/items`, "GET")
        if(!response.ok)
            throw new TypeError("Failed to fetch items");
        return (await response.json()) as string[];
    }

    async function sendRequest(uri: string, method: string, payload?: unknown) {
        return await fetch(uri, {
            method,
            body: JSON.stringify(payload),
            headers: [
                [
                    "Content-Type", "application/json"
                ]
            ]
        })
    }
}
