#!/usr/bin/env node

const path  = require('path');
const fs = require('fs');
const { program } = require('commander');
const _chalk = import("chalk").then(m=>m.default);
const { FileError, CompileError } = require('./errors');

const app_dir = path.dirname(require.main.filename);
const libpaths = [path.resolve(app_dir, './lib')];

const Compiler = require('./compiler');
const { Program, readProject, readBlocks, convertBlocks, saveFile } = require('./generator');
const { FileLoader, FileType } = require('./file_loader');
const { catch_compiler_errors } = require('./errors');

const loader = new FileLoader(
    [FileType.SW, FileType.SB3, FileType.JSON, FileType.YAML],
    ['project', 'main'],
);

const src_loader = new FileLoader(
    [FileType.SW, FileType.SB3],
    ['main']
);

function debug_init(options) {
    if (options.debug) {
        console.log('debugging enabled');
        console.log('running with options', options);
    }
}

async function load_manifest(file, options) {
    const project = file.read_yaml();
    const targets = project.targets || {};
    const build_targets = project.default || Object.keys(project.targets);
    
    const baseProjectDir = file.dir;
    const baseSrcDir = path.resolve(baseProjectDir, project.src_dir || "");
    const baseOutDir = path.resolve(baseProjectDir, project.out_dir || options.outDir);

    function map_options(obj) {
        const result = {};
        if (obj.debug) result.debug = true;
        if (obj.clean) result.clean = true;
        if (Array.isArray(obj.targets)) {
            if (obj.targets.includes('sb3')) result.targetSb3 = true;
            if (obj.targets.includes('html')) result.targetHtml = true;
            if (obj.targets.includes('project.json')) result.targetSb3Json = true;
            if (obj.targets.includes('blocks')) result.targetBlocks = true;
        }
        if (obj['turbowarp-hd-pen']) result.turbowarpHdPen = true;
        if (obj['turbowarp-fps']) result.turbowarpFps = obj['turbowarp-fps'];
        return result;
    }

    const baseOptions = Object.assign({}, options, map_options(project));

    if (baseOptions.debug) {
        console.log(project);
        console.log({
            baseSrcDir,
            baseOutDir,
        });
        console.log('project options:', baseOptions);
    }

    if (baseOptions.clean) {
        clean_dir(baseOutDir, baseOptions);
    }

    async function build_target(target_name) {
        const target = targets[target_name];
        if (!target) {
            throw new CompileError(`cannot find target "${target_name}"`);
        }

        const targetOptions = Object.assign({}, baseOptions, map_options(target));

        if (targetOptions.debug) {
            console.log('compiling target', target_name);
        }

        const targetSrcDir = path.join(baseSrcDir, target.src_dir || "");
        const targetOutDir = path.join(baseOutDir, target.out_dir || "");
        const targetSrcName = target.src || "";
        const targetOutName = target.out || "";

        if (targetOptions.debug) {
            console.log({
                targetSrcDir,
                targetOutDir,
                targetSrcName,
                targetOutName,
            });
            console.log('target options:', targetOptions);
        }

        Object.assign(targetOptions, {
            outDir: targetOutDir,
            outName: targetOutName,
        });

        try {
            console.log();
            const file = src_loader.file(path.join(targetSrcDir, targetSrcName), options);
            file.print_info();
            await build(file, targetOptions);
        } catch (err) {
            console.error(err);
        }
    }

    for (const target_name of build_targets) {
        try {
            await catch_compiler_errors(async () => {
                await build_target(target_name);
            });
        } catch (err) {
            console.error(err);
        }
    }
}

async function compile(file, options) {
    const program = new Program();
    const c = new Compiler(program, {
        path: libpaths,
        debug: options.debug,
        warp: !options.disableWarp,
    });

    c.file(file.path);
    c.relink();

    if (options.debug) {
        console.log(c.program.blockwriter.n, 'blocks');
    }

    return await program.build();
}

async function to_sb3(file, options) {
    file.expect([FileType.SW, FileType.SB3]);
    if (file.is(FileType.SB3)) {
        return await file.read_zip();
    }
    if (file.is(FileType.SW)) {
        return await compile(file, options);
    }
    throw new Error('never');
}

async function sb3_dump(sb3, options) {
    return await readProject(sb3);
}

async function sb3_inspect(sb3, options) {
    return convertBlocks(await readBlocks(sb3));
}

async function JSON_print(obj, options) {
    return JSON.stringify(obj, undefined, 4);
}

async function clean_dir(dir, options) {
    if (options.clean) {
        fs.mkdirSync(dir, { recursive: true });
        const files = fs.readdirSync(dir);
        for (const file of files) {
            fs.unlinkSync(path.resolve(dir, file));
        }
    }
}

async function clean(file, options) {
    const dir = path.resolve(file.dir, options.outDir);
    clean_dir(dir, options);
}

async function get_outfile(file, ext, options) {
    const dir = path.resolve(options.outDir);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.format({
        dir,
        ext,
        name: options.outName || file.name,
    });
    return out;
}

async function target_sb3_json(file, sb3, options) {
    const data = await sb3_dump(sb3, options);
    const str = await JSON_print(data);
    const outfile = await get_outfile(file, '.project.json', options);
    fs.writeFileSync(outfile, str);
    console.log(' - sb3-json -> ', outfile);
    return outfile;
}

async function target_blocks(file, sb3, options) {
    const data = await sb3_inspect(sb3, options);
    const str = await JSON_print(data);
    const outfile = await get_outfile(file, '.blocks.json', options);
    fs.writeFileSync(outfile, str);
    console.log(' - blocks -> ', outfile);
    return outfile;
}

async function target_sb3(file, sb3, options) {
    const outfile = await get_outfile(file, '.sb3', options);
    await saveFile(sb3, outfile);
    console.log(' - sb3 -> ', outfile);
    return outfile;
}

async function target_html(file, sb3, options) {
    const outfile = await get_outfile(file, '.html', options);
    const outname = path.parse(outfile).name;

    const Packager = require('@turbowarp/packager');
    const packager = new Packager.Packager();
    packager.project = await Packager.loadProject(sb3.generateAsync({type:'arraybuffer'}));
    packager.options.target = 'html';
    if (options.turbowarpFps) {
        packager.options.framerate = parseInt(options.turbowarpFps);
    }
    if (options.turbowarpHdPen) {
        packager.options.highQualityPen = true;
    }
    packager.options.fencing = false;
    packager.options.autoplay = true;
    packager.options.app.packageName = outname;
    packager.options.app.windowTitle = outname;
    const result = await packager.package();
    fs.writeFileSync(outfile, result.data);
    console.log(' - html -> ', outfile);
    return outfile;
}

async function build(file, options) {
    return await catch_compiler_errors(async () => {
        const sb3 = await to_sb3(file, options);
        console.log('building to targets:');
        if (options.targetSb3) await target_sb3(file, sb3, options);
        if (options.targetHtml) await target_html(file, sb3, options);
        if (options.targetSb3Json) await target_sb3_json(file, sb3, options);
        if (options.targetBlocks) await target_blocks(file, sb3, options);
    }, options.debug);
}

async function configure(file, options) {
    if (file.is(FileType.YAML)) {
        return await load_manifest(file, options);
    }
    return await build(file, options);
}

program.command('build')
    .argument('[input file]', 'project.yaml | source.sw | scratch.sb3', './')
    .option('--target-sb3', 'scratch 3 project', true)
    .option('--target-html', 'standalone html player', true)
    .option('--target-blocks', 'human-readable blocks', false)
    .option('--target-sb3-json', 'only the project.json file', false)
    .option('--out-dir <path>', undefined, 'out')
    .option('--out-name <name>')
    .option('--clean', 'clean the out-directory before building', false)
    .option('--turbowarp-fps <number>')
    .option('--turbowarp-hd-pen')
    .option('--debug', undefined, false)
    .action((infile, options) => {
        catch_compiler_errors(async () => {
            debug_init(options);
            const file = loader.file(infile, options);
            file.print_info();
            clean(file, options);
            configure(file, options);
        }, options.debug);
    });

program.command('watch')
    .argument('[input file]', 'project.yaml | source.sw | scratch.sb3', './')
    .option('--target-sb3', 'scratch 3 project', true)
    .option('--target-html', 'standalone html player', true)
    .option('--target-blocks', 'human-readable blocks', false)
    .option('--target-sb3-json', 'only the project.json file', false)
    .option('--out-dir <path>', undefined, 'out')
    .option('--out-name <name>')
    .option('--clean', 'clean the out-directory before building', false)
    .option('--turbowarp-fps <number>')
    .option('--turbowarp-hd-pen')
    .option('--debug', undefined, false)
    .action(async (infile, options) => {
        const chalk = await _chalk;

        await catch_compiler_errors(async () => {
            debug_init(options);
            const file = loader.file(infile, options);
            file.print_info();
            clean(file, options);

            let flag = true;
            file.watch_dir(['.sb3', '.json', '.html', '.blocks.json', '.blocks.json'], (changed_file, stats) => {
                if (options.debug) console.log(`changes detected in: `, changed_file);
                flag = true;
            });
            setInterval(async ()=>{
                if (flag) {
                    console.log(chalk.green('changes detected'));
                    flag = false;
                    try {
                        await configure(file, options);
                    } catch (err) {
                        console.error(err);
                    }
                }
            }, 1000);
        }, options.debug);
    });

program.command('file-info')
    .argument('<input file>', 'input file')
    .option('--debug', undefined, false)
    .description('get some details about a file')
    .action(async (infile, options) => {
        await catch_compiler_errors(async ()=>{
            debug_init(options);
            const file = loader.locate(infile, options);
            file.print_info();
        }, options.debug);
    });

program.parse();
