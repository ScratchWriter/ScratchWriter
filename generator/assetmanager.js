const path = require('path');
const crypto = require('crypto');
const { CompileError } = require('../errors');

const ASSET_TYPE = {
    IMAGE: 'IMAGE',
    SOUND: 'SOUND',
}

const FILE_ASSOCIATIONS = {
    '.png':     ASSET_TYPE.IMAGE,
    '.svg':     ASSET_TYPE.IMAGE,
    '.jpeg':    ASSET_TYPE.IMAGE,
    '.gif':     ASSET_TYPE.IMAGE,
    '.bmp':     ASSET_TYPE.IMAGE,
    '.wav':     ASSET_TYPE.SOUND,
    '.mp3':     ASSET_TYPE.SOUND,
}

class AssetPool {
    constructor() {
        this.handles = new Set();
    }

    get_handle(name, n=0) {
        const handle = n===0 ? name : name + '_' + String(n);
        if (this.handles.has(handle)) {
            return this.get_free(name, n+1);
        }
        return handle;
    }
}

function hash(data) {
    return crypto.createHash('md5').update(data).digest("hex")
}

class AssetManager {
    constructor() {
        this.costume_handles = new AssetPool();
        this.sounds_handles = new AssetPool();

        this.cache = {};

        this.costumes = [];
        this.sounds = [];

        this.files = {};

        this.pending = new Set();
    }

    is_asset(filename) {
        const pathparts = path.parse(filename);
        const type = FILE_ASSOCIATIONS[pathparts.ext];
        return !!type;
    }
    
    // load an asset file and return its handle as a string
    load(data, filepath, at) {
        if (filepath in this.cache) {
            return this.cache[filepath];
        } else {
            const handle = this.load_uncached(data, filepath, at);
            this.cache[filepath] = handle;
            return handle;
        }
    }

    load_uncached(data, filepath, at) {
        const pathparts = path.parse(filepath);
        const type = FILE_ASSOCIATIONS[pathparts.ext];
        if (type === ASSET_TYPE.IMAGE) {
            return this.image(data, pathparts, filepath, at);
        }
        if (type === ASSET_TYPE.SOUND) {
            return this.sound(data, pathparts, filepath, at);
        }
        throw new CompileError(`Unknown file type "${pathparts.ext}"`, at);
    }

    image(data, pathparts, filepath, at) {
        const handle = this.costume_handles.get_handle(pathparts.name);
        const descriptor = AssetManager.get_base_descriptor(handle, hash(data), pathparts);
        this.files[descriptor.md5ext] = data;
        this.costumes.push(descriptor);
        // this.job(...promise) can be used for async loading
        return handle;
    }

    sound(data, pathparts, at) {
        const handle = this.sounds_handles.get_handle(pathparts.name);
        const descriptor = AssetManager.get_base_descriptor(handle, hash(data), pathparts);
        this.files[descriptor.md5ext] = data;
        this.sounds.push(descriptor);
        // this.job(...promise) can be used for async loading
        return handle;
    }

    job(promise) {
        const self = this;
        self.pending.add(promise);
        promise.finally(() => self.pending.delete(promise));
        return promise;
    }

    async waitForAllJobs() {
        await Promise.all(Array.from(this.pending));
    }

    async inject(target) {
        await this.waitForAllJobs();
        target.costumes = [
            ...target.costumes,
            ...this.costumes,
        ];
        target.sounds = [
            ...target.sounds,
            ...this.sounds,
        ];
    }

    async write(zip) {
        await this.waitForAllJobs();
        for (const [file, data] of Object.entries(this.files)) {
            zip.file(file, data);
        }
    }

    static get_base_descriptor(handle, md5, pathparts) {
        return {
            name: handle,
            assetId: md5,
            md5ext: path.format({name: md5, ext: pathparts.ext}),
            dataFormat: pathparts.ext.slice(1),
        }
    }
}

module.exports = { AssetManager };