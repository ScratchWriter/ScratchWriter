const fs = require('fs');
const path  = require('path');
const hound = require('hound');
const JSZip = require("jszip");
const YAML = require('yaml');
const { FileError } = require('./errors');

class FileType {
    constructor(ext, type) {
        this.ext = ext;
        this.type = type;
    }

    static PROJECT = 'project';
    static SOURCE = 'source';
    static PROJECT_JSON = 'project.json';
    static PROJECT_MANIFEST = 'project_manifest';
    
    static SB3 = new FileType('.sb3', FileType.PROJECT);
    static SW = new FileType('.sw', FileType.SOURCE);
    static JSON = new FileType('.json', FileType.PROJECT_JSON);
    static YAML = new FileType('.yaml', FileType.PROJECT_MANIFEST);
}

class FileLoader {
    constructor(types, names) {
        this.formats = [''];
        this.explicit_formats = [];
        this.types = {};
        this.file_names = [''];
        for (const t of types) this.add_filetype(t);
        for (const n of names) this.add_filename(n);
    }

    add_filetype(filetype) {
        this.formats.push(filetype.ext);
        this.explicit_formats.push(filetype.ext);
        this.types[filetype.ext] = filetype.type;
    }

    add_filename(name) {
        this.file_names.push(name);
    }

    locate_exact(file, options) {
        if (fs.existsSync(file)) {
            const parts = path.parse(file);
            const handle = new FileHandle({
                path: file,
                name: parts.name,
                ext: parts.ext,
                dir: parts.dir,
                type: this.types[parts.ext],
            });
            if (options.debug) console.debug('located file', file);
            for (const ext of this.explicit_formats) {
                if (ext === handle.ext) return handle;
            }
            
        }
        if (options.debug) console.debug('failed to locate', file);
    }

    locate_format(file, options) {
        for (const ext of this.formats) {
            const attempt = file + ext;
            const result = this.locate_exact(attempt, options);
            if (result) return result;
        }
    }

    locate_file(file, options) {
        for (const name of this.file_names) {
            const attempt = path.join(file, name);
            const result = this.locate_format(attempt, options);
            if (result) return result;
        }
    }

    file(file, options) {
        const r = this.locate_file(path.resolve(file), options);
        if (r) return r;
        throw new FileError(`Unable to locate file ${file}`);
    }
}

class FileHandle {
    constructor(options) {
        this.path = options.path;
        this.name = options.name;
        this.ext = options.ext;
        this.dir = options.dir;
        this.type = options.type;
    }

    with_ext(ext) {
        return path.format({
            dir: this.dir,
            name: this.name,
            ext,
        });
    }

    print_info() {
        console.log(this.path);
        console.log(' - name:', this.name);
        console.log(' - ext:', this.ext);
        console.log(' - type:', this.type);
    }

    expect(types) {
        for (const t of types) {
            if (this.ext === t.ext) return;
        }
        throw new FileError(`Invalid file-type "${this.ext}"`)
    }

    is(type) {
        return this.ext === type.ext;
    }

    read() {
        try {
            return fs.readFileSync(this.path, { encoding: 'utf8' });
        } catch (err) {
            throw new FileError(err.message);
        }
    }

    watch_dir(ignore_exts, cb) {
        const watcher = hound.watch(this.dir);
        watcher.on('change', (changed_file, stats)=>{
            if (ignore_exts.includes(path.extname(changed_file))) return;
            cb(changed_file, stats);
        });
    }

    read_zip() {
        return new Promise((resolve, reject)=>{
            fs.readFile(this.path, function(err, data) {
                if (err) {
                    reject(err)
                } else {
                    JSZip.loadAsync(data).then(function (zip) {
                        resolve(zip);
                    });
                }
            });
        });
    }

    read_yaml() {
        return YAML.parse(this.read());
    }
}

module.exports = { FileLoader, FileType };