export module Config {
    let config = null as ClientConfig;

    export async function getConfig() {
        return config ?? (config = await fetch("clientConfig.json").then(x => x.json() as Promise<ClientConfig>));
    }

    export interface ClientConfig {
        apiUri: string;
    }
}