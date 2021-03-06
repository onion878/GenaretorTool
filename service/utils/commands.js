const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const FitAddon = require('xterm-addon-fit').FitAddon;
const {remote} = require('electron');
const {strip} = require('ansicolor');

class Commands {
    constructor() {
        this.term = null;
        this.msg = null;
        this.nowPty = null;
        this.systemCmd = false;
        this.workFlag = false;
        this.fitAddon = new FitAddon();
        this.config = require('../dao/system');
        if (this.config.getTheme() == 'dark') {
            this.color1 = '#424242';
            this.color2 = '#222';
        } else {
            this.color1 = '#FFFFFF';
            this.color2 = '#FAFAFA';
        }
    }

    init(element) {
        const that = this;
        that.msg = document.getElementById('status-msg');
        return new Promise((resolve, reject) => {
            let terminal = this.config.getConfig('terminal');
            if (terminal.trim().length == 0) {
                terminal = process.env[os.platform() == 'win32' ? 'COMSPEC' : 'SHELL'];
                this.systemCmd = true;
            }
            if (this.nowPty == null) {
                that.initNodePty(terminal, resolve, element);
            } else {
                that.initXterm(terminal, resolve, element);
                resolve(that.nowPty, that.term);
            }
        });
    }

    initNodePty(userBash, resolve, element) {
        const that = this;
        const ptyProcess = pty.spawn(userBash, [], {
            cols: 180,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });
        that.nowPty = ptyProcess;
        that.initXterm(userBash, resolve, element);
        that.nowPty.on('data', function (data) {
            that.msg.innerHTML = strip(data);
            if (data.toLocaleUpperCase().indexOf('(Y/N)?') > -1) {
                that.nowPty.write('Y\r');
            }
            if (data.indexOf('running done!') > -1) {
                remote.getCurrentWindow().send('terminal-end', 'end');
            }
            that.term.write(data);
        });
        resolve(that.nowPty, that.term);
    }

    initXterm(userBash, resolve, element) {
        const that = this;
        // Initialize xterm.js and attach it to the DOM
        let font = execute('userConfig', 'getConfig', ['font']),
            fontSize = execute('userConfig', 'getConfig', ['fontSize']);
        if (font == null || font == 'default') {
            font = 'sans-serif';
        }
        if (fontSize == null) {
            fontSize = 13;
        }
        that.term = new Terminal({
            fontSize: fontSize,
            fontFamily: font,
            theme: {
                foreground: that.ColorReverse(that.color2),
                background: that.color2,
                cursor: that.ColorReverse(that.color2),
                selection: 'rgba(255, 255, 255, 0.3)',
                black: that.ColorReverse(that.color2),
                red: '#e06c75',
                brightRed: '#e06c75',
                green: '#A4EFA1',
                brightGreen: '#A4EFA1',
                brightYellow: '#EDDC96',
                yellow: '#EDDC96',
                magenta: '#e39ef7',
                brightMagenta: '#e39ef7',
                cyan: '#5fcbd8',
                brightBlue: '#5fcbd8',
                brightCyan: '#5fcbd8',
                blue: '#5fcbd8',
                white: that.ColorReverse(that.color2),
                brightBlack: '#808080',
                brightWhite: that.ColorReverse(that.color1)
            }
        });
        that.term.open(element);
        that.term.loadAddon(that.fitAddon);
        that.fitAddon.fit();
    }

    ColorReverse(OldColorValue) {
        OldColorValue = "0x" + OldColorValue.replace(/#/g, "");
        let str = "000000" + (0xFFFFFF - OldColorValue).toString(16);
        return '#' + str.substring(str.length - 6, str.length);
    }

    fitTerm() {
        if (this.term != null) {
            this.fitAddon.fit();
        }
    }

    resetTerm() {
        this.term.reset()
    }

    clearTerm() {
        this.term.clear();
    }

    cancelPty() {
        this.nowPty.write("\x03\r");
    }

    cdTargetFolder(folder) {
        if (this.nowPty == null) return;
        const platform = process.platform;
        if (this.systemCmd && platform == 'win32') {
            this.nowPty.write(`cd /d ${folder}\r`);
        } else {
            if (platform == 'darwin') {
                this.nowPty.write(`cd ${folder.replace(/ /g, '\\ ')}\r`);
            } else {
                this.nowPty.write(`cd ${folder}\r`);
            }
        }
        this.workFlag = true;
    }

    write(shell) {
        this.nowPty.write(shell + "\r");
    }

    destroy() {
        if (this.nowPty != null) {
            this.nowPty.destroy();
            this.nowPty = null;
            this.term = null;
            this.systemCmd = false;
            this.workFlag = false;
        }
    }
}

module.exports = new Commands();
