export var Config;
(function (Config) {
    let config = null;
    async function getConfig() {
        return config ?? (config = await fetch("clientConfig.json").then(x => x.json()));
    }
    Config.getConfig = getConfig;
})(Config || (Config = {}));
