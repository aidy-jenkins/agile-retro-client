export class Query {
    constructor(queryString) {
        this.queryString = queryString;
        this._parsedString = null;
    }
    get parsedString() {
        if (this._parsedString)
            return this._parsedString;
        if (this.queryString.startsWith('?'))
            this.queryString = this.queryString.substr(1);
        this._parsedString = this.queryString
            .split('&')
            .map(keyValue => keyValue.split('='))
            .map(([key, value]) => [key, value ?? "true"])
            .reduce((prev, [key, value]) => (void (prev[key] = value), prev), Object.create(null));
        return this._parsedString;
    }
    get(key) {
        return this.parsedString[key];
    }
}
