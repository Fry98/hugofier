const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');
const { promisify } = require('util');
const { join } = require('path');
const fs = require('fs');
const write = promisify(fs.write);

const newLen = new Uint8Array([0x85, 0x25, 0x45, 0x00]);
const mmLen = new Uint8Array([0x83, 0xB1, 0x9A, 0x00]);
const mm0Len = new Uint8Array([0x13, 0x4B, 0x9B, 0x00]);

const mmOffset = 224246082;
const mm0Offset = 245660536;
const lenOffsets = [
  0x48A8,
  0x48B0,
  0x4988,
  0x4990
];

let hugoDadBuff = null;
let mmBuff = null
let mm0Buff = null;

try {
  hugoDadBuff = fs.readFileSync(join(__dirname, './binary/hugo_dad.bin'));
  mmBuff = fs.readFileSync(join(__dirname, './binary/mm_bckp.bin'));
  mm0Buff = fs.readFileSync(join(__dirname, './binary/mm0_bckp.bin'));
} catch (err) {
  dialog.showErrorBox('Load Error', 'Error loading patch data');
  ipcRenderer.send('get-fucked');
}

const pathDiv = document.getElementById('path');
const loadBtn = document.getElementById('load');
const patchBtn = document.getElementById('patch');
const unpatchBtn = document.getElementById('unpatch');
let fd = null;

loadBtn.onclick = () => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'SND File', extensions: ['snd'] }
    ]
  }).then((files) => {
    if (files.filePaths.length === 0) return;
    fs.open(files.filePaths[0], 'r+', (err, fileData) => {
      if (err) {
        dialog.showErrorBox('Load Error', 'Unable to open selected file');
        return;
      }

      fd = fileData;
      pathDiv.textContent = files.filePaths[0];
      pathDiv.classList.add('active');

      patchBtn.disabled = false;
      unpatchBtn.disabled = false;
    });
  });
};

patchBtn.onclick = async () => {
  for (const offset of lenOffsets) {
    try {
      await write(fd, newLen, 0, 4, offset);
    } catch {
      dialog.showErrorBox('Load Error', `Unable to write data on the offset ${offset}`);
      break;
    }
  }

  await write(fd, hugoDadBuff, 0, hugoDadBuff.size, mmOffset);
  await write(fd, hugoDadBuff, 0, hugoDadBuff.size, mm0Offset);
  dialog.showMessageBox({
    title: 'Patch Complete',
    message: 'Game files successfully patched'
  });
};

unpatchBtn.onclick = async () => {
  for (let i = 0; i < lenOffsets.length; i++) {
    try {
      i < 2 ?
        await write(fd, mmLen, 0, 4, lenOffsets[i]) :
        await write(fd, mm0Len, 0, 4, lenOffsets[i]);
    } catch {
      dialog.showErrorBox('Load Error', `Unable to write data on the offset ${offset}`);
      break;
    }
  }

  await write(fd, mmBuff, 0, mmBuff.size, mmOffset);
  await write(fd, mm0Buff, 0, mm0Buff.size, mm0Offset);
  dialog.showMessageBox({
    title: 'Patch Complete',
    message: 'Game files successfully unpatched'
  });
};
