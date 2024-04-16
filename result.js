class Result {
    constructor(data, err) {
        this.data = data;
        this.err = err;
    }

    error(cb) {
        return this;
    }

    ok(cb) {
        return this;
    }

    unwrap_unsafe() {
        throw new Error('never');
    }

    unwrap_or(or) {
        return or;
    }

    is_err() {
        throw new Error('never');
    }

    static ok(data) {
        return new ResultOk(data);
    }

    static err(err) {
        return new ResultErr(err);
    }
}

class ResultOk extends Result {
    constructor(data) {
        super(data, null);
    }

    ok(cb) {
        cb(this.data);
        return this;
    }

    unwrap_unsafe() {
        return this.data;
    }

    unwrap_or(or) {
        return this.data;
    }

    is_err() {
        return false;
    }
}

class ResultErr extends Result {
    constructor(err) {
        super(null, err);
    }

    error(cb) {
        cb(this.err);
        return this;
    }

    unwrap_unsafe() {
        throw this.err;
    }

    is_err() {
        return true;
    }
}

module.exports = { Result };