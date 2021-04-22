"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = exports.linq = exports.Enumerable = exports.Linq = void 0;
const Linq = (data) => {
    return new Enumerable(function* () {
        for (let item of data) {
            yield item;
        }
    });
};
exports.Linq = Linq;
class Enumerable {
    constructor(_data) {
        this._data = _data;
        this[Symbol.iterator] = this._data;
    }
    aggregate(arg0, accumulatorFunc, resultSelector) {
        let seed;
        if (arguments.length === 1 && typeof arg0 === 'function')
            accumulatorFunc = arg0;
        else
            seed = arg0;
        for (let value of this.data) {
            if (seed !== void 0) {
                seed = accumulatorFunc(seed, value);
            }
            else {
                seed = value;
                continue;
            }
        }
        if (seed === void 0) {
            throw new TypeError("Sequence contained no elements");
        }
        if (resultSelector) {
            return resultSelector(seed);
        }
        return seed;
    }
    all(predicate) {
        for (let item of this.data) {
            if (!predicate(item))
                return false;
        }
        return true;
    }
    any(predicate) {
        if (predicate)
            return !this.all(x => !predicate(x));
        else {
            let { done } = this.data[Symbol.iterator]().next();
            return !done;
        }
    }
    append(value) {
        return new Enumerable(function* () {
            for (let item of this.data) {
                yield item;
            }
            yield value;
        }.bind(this));
    }
    average() {
        let array = this.toArray();
        return (array.reduce((ag, current) => ag + current, 0) / array.length);
    }
    cast(type) {
        return new Enumerable(function* () {
            for (let item of this.data) {
                yield Enumerable.TypeMap[type](item);
            }
        }.bind(this));
    }
    concat(collection) {
        return new Enumerable(function* () {
            for (let item of this.data) {
                yield item;
            }
            for (let item of collection.data) {
                yield item;
            }
        }.bind(this));
    }
    contains(value, comparer) {
        if (comparer)
            return this.any(val => comparer(val, value));
        else
            return this.any(val => val === value);
    }
    count(predicate) {
        if (predicate !== void 0)
            return this.where(predicate).count();
        let count = 0;
        for (let item of this.data)
            ++count;
        return count;
    }
    defaultIfEmpty(defaultValue) {
        if (!this.any())
            return exports.linq([defaultValue ?? null]);
        else
            return this;
    }
    distinct(comparer) {
        if (!comparer)
            comparer = (a, b) => a === b;
        let returned = [];
        return new Enumerable(function* () {
            for (let item of this.data) {
                if (returned.every(value => !comparer(value, item))) {
                    returned.push(item);
                    yield item;
                }
            }
        }.bind(this));
    }
    elementAt(index) {
        let { success, value } = this.elementAt_internal(index);
        if (!success)
            throw new TypeError("Index not found");
        return value;
    }
    elementAtOrDefault(index) {
        let { success, value } = this.elementAt_internal(index);
        if (!success)
            return null;
        return value;
    }
    elementAt_internal(index) {
        let i = 0;
        for (let item of this.data) {
            if (i === index)
                return { success: true, value: item };
            ++i;
        }
        return { success: false, value: null };
    }
    static empty() {
        return exports.linq([]);
    }
    except(collection, comparer) {
        if (!comparer)
            comparer = (a, b) => a === b;
        return this.where(item => !collection.any(x => comparer(x, item)));
    }
    first(predicate) {
        if (predicate)
            return this.where(predicate).first();
        let { success, value } = this.first_internal();
        if (!success) {
            throw new TypeError("No value found");
        }
        return value;
    }
    firstOrDefault(predicate) {
        if (predicate)
            return this.where(predicate).firstOrDefault();
        let { success, value } = this.first_internal();
        if (!success) {
            return null;
        }
        return value;
    }
    first_internal() {
        let iterator = this.data[Symbol.iterator]();
        let { done, value } = iterator.next();
        return { success: !done, value };
    }
    groupBy(keySelector, arg1, additionalParameters) {
        let options = Object.create(null);
        if (typeof arg1 === 'function')
            Object.assign(options, { elementSelector: arg1, ...additionalParameters });
        else
            Object.assign(options, arg1);
        let { elementSelector, resultSelector, comparer } = options;
        if (!elementSelector)
            elementSelector = x => x;
        if (!comparer)
            comparer = (a, b) => a === b;
        return new Enumerable(function* () {
            let keys = this.select(keySelector).distinct();
            for (let key of keys) {
                let groupItem = Object.assign(this.where(item => comparer(key, keySelector(item))).select(elementSelector), { key });
                if (resultSelector)
                    yield resultSelector(groupItem.key, groupItem);
                else
                    yield groupItem;
            }
        }.bind(this));
    }
    groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {
        if (!comparer)
            comparer = (a, b) => a === b;
        return this.select(item => resultSelector(item, inner.where(innerItem => comparer(outerKeySelector(item), innerKeySelector(innerItem)))));
    }
    intersect(collection, comparer) {
        if (!comparer)
            comparer = (a, b) => a === b;
        return this.where(item => collection.contains(item, comparer));
    }
    join(inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {
        if (!comparer)
            comparer = (a, b) => a === b;
        return this.selectMany(item => inner.where(innerItem => comparer(outerKeySelector(item), innerKeySelector(innerItem))).select(innerItem => resultSelector(item, innerItem)));
    }
    last(predicate) {
        if (!predicate)
            predicate = () => true;
        let notFound = true;
        let result;
        for (let item of this.data) {
            if (predicate(item)) {
                result = item;
                notFound = false;
            }
        }
        if (notFound)
            throw new TypeError("No item found");
        return result;
    }
    lastOrDefault(predicate) {
        try {
            return this.last(predicate);
        }
        catch (err) {
            if (err.message === "No item found")
                return null;
            else
                throw err;
        }
    }
    longCount(predicate) {
        if (!predicate)
            predicate = () => true;
        let count = BigInt(0);
        for (let item of this.data) {
            if (predicate(item))
                ++count;
        }
        return count;
    }
    max() {
        let array = this.toArray();
        if (array.length === 0)
            throw new TypeError("No values in collection");
        return array.reduce((prev, curr) => prev > curr ? prev : curr);
    }
    min() {
        let array = this.toArray();
        if (array.length === 0)
            throw new TypeError("No values in collection");
        return array.reduce((prev, curr) => prev < curr ? prev : curr);
    }
    ofType(type) {
        return this.where(item => typeof item === type);
    }
    orderBy(keySelector, comparer) {
        if (!comparer)
            comparer = (a, b) => a < b ? -1 : 1;
        return new OrderedEnumerable(function* () {
            let values = this.select(item => [keySelector(item), item]).toArray();
            values.sort(([leftKey, _], [rightKey, __]) => comparer(leftKey, rightKey));
            for (let value of values)
                yield value;
        }.bind(this));
    }
    orderByDescending(keySelector, comparer) {
        if (!comparer)
            comparer = (a, b) => a < b ? -1 : 1;
        return this.orderBy(keySelector, (a, b) => (comparer(a, b) * -1));
    }
    prepend(value) {
        return new Enumerable(function* () {
            yield value;
            for (let item of this.data) {
                yield item;
            }
        }.bind(this));
    }
    static range(start, count) {
        return new Enumerable((function* () {
            for (let i = start; i < (start + count); ++i)
                yield i;
        }));
    }
    static repeat(value, count) {
        return new Enumerable((function* () {
            for (let i = 0; i < count; ++i)
                yield value;
        }));
    }
    reverse() {
        return new Enumerable(function* () {
            let values = this.toArray().reverse();
            for (let item of values)
                yield item;
        }.bind(this));
    }
    get data() {
        return this._data();
    }
    select(callback) {
        return new Enumerable((function* () {
            let iterator = this.data[Symbol.iterator]();
            for (let index = 0; true; ++index) {
                let { done, value } = iterator.next();
                if (done)
                    break;
                yield callback(value, index);
            }
        }).bind(this));
    }
    selectMany(selector, resultSelector) {
        if (!resultSelector)
            resultSelector = (_, x) => x;
        return new Enumerable(function* () {
            let iterator = this.data[Symbol.iterator]();
            for (let index = 0; true; ++index) {
                let { done, value } = iterator.next();
                if (done)
                    break;
                let collection = selector(value, index);
                if (resultSelector) {
                    for (let item of collection) {
                        yield resultSelector(value, item);
                    }
                }
                else {
                    for (let item of collection) {
                        yield item;
                    }
                }
            }
        }.bind(this));
    }
    sequenceEqual(otherCollection, comparer) {
        if (!comparer)
            comparer = (a, b) => a === b;
        let iterator = this.data[Symbol.iterator]();
        let otherIterator = otherCollection.data[Symbol.iterator]();
        for (let index = 0; true; ++index) {
            let { done, value } = iterator.next();
            let { done: otherDone, value: otherValue } = otherIterator.next();
            if (done !== otherDone)
                return false;
            if (done)
                break;
            if (!comparer(value, otherValue))
                return false;
        }
        return true;
    }
    single(predicate) {
        if (!predicate)
            predicate = () => true;
        let iterator = this.data[Symbol.iterator]();
        let item;
        let found = false;
        for (let index = 0; true; ++index) {
            let { done, value } = iterator.next();
            if (done)
                break;
            if (predicate(value)) {
                if (found)
                    throw new TypeError("More than one value present in sequence");
                item = value;
                found = true;
            }
        }
        if (!found)
            throw new TypeError("No value found");
        return item;
    }
    singleOrDefault(predicate) {
        if (!predicate)
            predicate = () => true;
        let iterator = this.data[Symbol.iterator]();
        let item;
        let found = false;
        for (let index = 0; true; ++index) {
            let { done, value } = iterator.next();
            if (done)
                break;
            if (predicate(value)) {
                if (found)
                    throw new TypeError("More than one value present in sequence");
                item = value;
                found = true;
            }
        }
        return item ?? null;
    }
    skip(count) {
        return new Enumerable(function* () {
            let i = 0;
            for (let item of this.data) {
                if (i >= count) {
                    yield item;
                }
                ++i;
            }
        }.bind(this));
    }
    skipLast(count) {
        if (count <= 0)
            return exports.linq(this.data);
        return this.reverse().skip(count).reverse();
    }
    skipWhile(condition) {
        return new Enumerable(function* () {
            let i = 0;
            let passed = false;
            for (let item of this.data) {
                if (!passed) {
                    if (condition(item, i))
                        continue;
                    else
                        passed = true;
                }
                yield item;
                ++i;
            }
        }.bind(this));
    }
    sum() {
        let array = this.toArray();
        if (array.length === 0)
            throw new TypeError("No values in collection");
        return array.reduce((prev, curr) => prev + (curr ?? 0), 0);
    }
    take(count) {
        return new Enumerable(function* () {
            let i = 0;
            for (let item of this.data) {
                if (i === count)
                    break;
                yield item;
                ++i;
            }
        }.bind(this));
    }
    takeLast(count) {
        if (count <= 0)
            return Enumerable.empty();
        return this.reverse().take(count).reverse();
    }
    takeWhile(condition) {
        return new Enumerable(function* () {
            let i = 0;
            for (let item of this.data) {
                if (!condition(item, i))
                    break;
                yield item;
                ++i;
            }
        }.bind(this));
    }
    toArray() {
        return Array.from(this.data);
    }
    toDictionary(keySelector, arg1, comparer) {
        let elementSelector;
        if (arg1) {
            if (typeof arg1 === 'function')
                elementSelector = arg1;
            else
                comparer = arg1.comparer;
        }
        let grouped = this.groupBy(keySelector, { comparer: comparer, elementSelector: elementSelector });
        let map = new Map();
        for (let item of grouped) {
            map.set(item.key, item.single());
        }
        return map;
    }
    toHashSet(comparer) {
        return new Set(comparer ? this.distinct(comparer) : this.data);
    }
    toList() {
        return this.toArray();
    }
    toLookup(keySelector, arg1, comparer) {
        let elementSelector;
        if (arg1) {
            if (typeof arg1 === 'function')
                elementSelector = arg1;
            else
                comparer = arg1.comparer;
        }
        let grouped = this.groupBy(keySelector, { comparer: comparer, elementSelector: elementSelector });
        let map = new Map();
        for (let item of grouped) {
            map.set(item.key, item);
        }
        return map;
    }
    union(collection, comparer) {
        return new Enumerable(function* () {
            for (let item of this.data) {
                yield item;
            }
            for (let item of collection) {
                yield item;
            }
        }.bind(this)).distinct(comparer);
    }
    where(predicate) {
        return new Enumerable((function* () {
            let index = 0;
            for (let item of this.data) {
                if (predicate(item, index))
                    yield item;
                ++index;
            }
        }).bind(this));
    }
    static zip(leftCollection, rightCollection, resultSelector) {
        return new Enumerable((function* () {
            let leftIterator = leftCollection.data[Symbol.iterator]();
            let rightIterator = rightCollection.data[Symbol.iterator]();
            for (let index = 0; true; ++index) {
                let { done, value } = leftIterator.next();
                let { done: otherDone, value: otherValue } = rightIterator.next();
                if (done || otherDone)
                    return;
                if (resultSelector)
                    yield resultSelector(value, otherValue);
                else
                    yield [value, otherValue];
            }
        }));
    }
}
exports.Enumerable = Enumerable;
Enumerable.TypeMap = {
    "number": Number,
    "boolean": Boolean,
    "string": String,
    "bigint": BigInt
};
class OrderedEnumerable extends Enumerable {
    constructor(data) {
        super(null);
        this._sortedData = data;
        this._data = function* () {
            for (let [key, value] of this.sortedData) {
                yield value;
            }
        }.bind(this);
        this[Symbol.iterator] = this._data;
    }
    get sortedData() {
        return this._sortedData();
    }
    ;
    thenBy(keySelector, comparer) {
        return new OrderedEnumerable(function* () {
            let grouped = exports.linq(Array.from(this.sortedData)).groupBy(([key, value]) => key);
            for (let group of grouped) {
                let sortedGroup = exports.linq(group).orderBy(([_, value]) => keySelector(value), comparer);
                for (let [key, [outerKey, value]] of sortedGroup.sortedData) {
                    yield [key, value];
                }
            }
        }.bind(this));
    }
    thenByDescending(keySelector, comparer) {
        if (!comparer)
            comparer = (a, b) => a < b ? -1 : 1;
        return this.thenBy(keySelector, (a, b) => (comparer(a, b) * -1));
    }
}
exports.linq = exports.Linq;
class Collection extends Enumerable {
}
exports.Collection = Collection;
