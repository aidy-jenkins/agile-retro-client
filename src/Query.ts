export class Query {

    protected _parsedString = null as { [index: string]: string; };
    protected get parsedString() {
        if(this._parsedString)
            return this._parsedString;

        if(this.queryString.startsWith('?'))
            this.queryString = this.queryString.substr(1);

        this._parsedString = this.queryString
                                .split('&')
                                .map(keyValue => keyValue.split('='))
                                .map(([key, value]) => [key, value ?? "true"])
                                .reduce((prev, [key, value]) => (void (prev[key] = value), prev), Object.create(null));
        
        return this._parsedString;
    }

    get(key: string) {
        return this.parsedString[key];
    }

    constructor(protected queryString: string) {

    }
}