const fs = require("fs");
const { dirname, resolve } = require('path');
const app_dir = dirname(require.main.filename);
const base_project_path = resolve(app_dir, './assets/base.sb3');

const JSZip = require("jszip");

const {objectMap} = require('../util.js');

// open a .sb3 file
function loadFile(path) {
    return new Promise((resolve, reject)=>{
        fs.readFile(path, function(err, data) {
            if (err) {
                reject(err)
            } else {
                JSZip.loadAsync(data).then(function (zip) {
                    resolve(zip);
                });
            }
        });
    })
}

function saveFile(zip, path) {
    return new Promise((resolve,reject)=>{
        zip.generateNodeStream({type:'nodebuffer', streamFiles:true})
        .pipe(fs.createWriteStream(path))
        .on('finish', function () {
            resolve();
        });
    })
}

// open the project.json file
async function readProject(zip) {
    const file = zip.file('project.json');
    const data = JSON.parse(await file.async('string'));
    return data;
}

// extract the blocks
async function readBlocks(zip) {
    const file = zip.file('project.json');
    const data = JSON.parse(await file.async('string'));
    const targets = data.targets;
    const blocks = {};
    for (const target of targets) {
        Object.assign(blocks, target.blocks);
    }
    return blocks;
}

function locateTarget(data) {
    const targets = data.targets;
    for (const target of targets) {
        if (target.isStage === false) return target;
    }
    throw new Error(`Unable to locate target sprite.`);
}

// convert into human-readable json
function convertBlocks(blocks) {
    const output = [];
    const topLevelBlocks = getTopLevelBlocks(blocks);
    for (const id of topLevelBlocks) {
        output.push(renderBlocks(id, blocks));
    }

    return output;
}

function renderBlocks(id, blocks) {
    if (!(id in blocks)) return [];

    const block = blocks[id];
    const result = {
        opcode: block.opcode
    };

    const inputs = renderInputs(id, blocks);
    const fields = renderFields(id, blocks);
    const mutation = block.mutation;

    if (inputs) result.inputs = inputs;
    if (fields) result.fields = fields;
    if (mutation) result.mutation = mutation;

    return [result, ...renderBlocks(block.next, blocks)]
}

function renderInputs(id, blocks) {
    const block = blocks[id];
    if (!Object.keys(block.inputs).length) return undefined;
    return objectMap(block.inputs, ([key, value])=>([key, renderInput(value, blocks)]));
}

const dataTypes = {
    4: "Number",
    5: "Positive Number",
    6: "Positive integer",
    7: "Integer",
    8: "Angle",
    9: "Color",
    10: "String",
    11: "Broadcast",
    12: "Variable",
    13: "List",
}

function renderInput(input, blocks) {
    const shadow = input[0];
    const block = input[1];

    if (Array.isArray(block)) {
        return renderInlineBlock(block);
    }

    return renderBlocks(block, blocks);
}

function renderInlineBlock(data) {
    const type = dataTypes[data[0]] || 'Unknown';
    const value = data[1];
    return {
        value, type,
    }
}

function getTopLevelBlocks(blocks) {
    const topLevelBlocks = [];
    for (const [id, block] of Object.entries(blocks)) {
        if (block.topLevel) {
            topLevelBlocks.push(id);
        }
    }
    return topLevelBlocks;
}

function renderFields(id, blocks) {
    const block = blocks[id];
    if (!Object.keys(block.fields).length) return undefined;
    return block.fields;
}

function loadBaseProject() {
    return loadFile(baseproject);
}

module.exports = {
    loadFile,
    saveFile,
    readProject,
    readBlocks,
    convertBlocks,
    locateTarget,
    getTopLevelBlocks,
    base_project_path,
}