const fs = require('fs');
const request = require('request');
const shell = require('shelljs');
const child = require('child_process').execFile;
const childSync = require('child_process').execFileSync;
const marked = require('marked');

class Utils {

    isEmpty(val) {
        if (val !== undefined && val != null && (val + '').trim() !== '') return false; else return true;
    }

    notEmpty(val) {
        return !this.isEmpty(val);
    }

    clear(data) {
        for (const key in data) {
            data[key] = null;
        }
    }

    getStringDate(date) {
        const Y = date.getFullYear();
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        const D = date.getDate() + ' ';
        const selectDate = Y + '-' + M + (parseInt(D, 0) < 10 ? '0' + D : D) + '';
        return (selectDate);
    }

    getStringLongDate(date) {
        const Y = date.getFullYear();
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        const D = date.getDate() + ' ';
        const selectDate = Y + '-' + M + (parseInt(D, 0) < 10 ? '0' + D : D) + ' 00:00:00';
        return (selectDate);
    }

    getNow() {
        const date = new Date();
        const Y = date.getFullYear();
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        const D = date.getDate() + ' ';
        const selectDate = Y + '-' + M + (parseInt(D, 0) < 10 ? '0' + D : D) + '';
        return (selectDate);
    }

    getNowTime() {
        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();

        let code = date.getFullYear() + '-' + toForMatter(month) + '-' +
            toForMatter(day) + ' ' + toForMatter(hours) + ':' + toForMatter(min)
            + ':' + toForMatter(sec);

        function toForMatter(num) {
            if (num < 10) {
                num = "0" + num;
            }
            return num + "";
        }

        return code;
    }

    getNowYear() {
        const date = new Date();
        const Y = date.getFullYear() + '';
        return Y;
    }

    shuffle(arr) {
        let i = arr.length, t, j;
        while (i) {
            j = Math.floor(Math.random() * i--);
            t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
        }
        return arr;
    }

    getUUID() {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }

    writeFile({path, content}) {
        try {
            fs.writeFileSync(path, content, 'utf8');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    createFile(path, content) {
        try {
            path = path.replace(/\\/g, '/');
            const filePath = path.substring(0, path.lastIndexOf(`/`));
            if (!fs.existsSync(filePath)) {
                shell.mkdir('-p', filePath);
            }
            fs.writeFileSync(path, content, 'utf8');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    readFile(path) {
        path = path.replace(/\\/g, '/');
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf8');
        } else {
            return null;
        }
    }

    unLinkFile(path) {
        path = path.replace(/\\/g, '/');
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    }

    openCodeFolder(file, folder) {
        child(file, [folder], function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

    runFile(file, args) {
        return childSync(file, args, {shell: true});
    }

    fileExists(path) {
        return fs.existsSync(path);
    }

    getNowTimeCode() {
        let date = new Date();
        let month = (date.getMonth()) + 1;
        let day = date.getDate();
        let hours = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();

        let code = date.getFullYear() + toForMatter(month) +
            toForMatter(day) + toForMatter(hours) + toForMatter(min)
            + toForMatter(sec);

        function toForMatter(num) {
            if (num < 10) {
                num = "0" + num;
            }
            return num + "";
        }

        return code;
    }

    uploadFile(file, name, data, auth) {
        return new Promise((resolve, reject) => {
            data['file'] = {
                value: fs.createReadStream(file),
                options: {
                    filename: name,
                    contentType: 'application/zip'
                }
            };
            const userConfig = require('../dao/user');
            const url = userConfig.getUrl() + '/upload';
            const options = {
                method: "POST",
                url: url,
                headers: {
                    "Authorization": "Bearer " + auth,
                    "Content-Type": "multipart/form-data"
                },
                formData: data
            };

            request(options, function (err, res, body) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(JSON.parse(body));
            });
        });
    }

    downloadFile(file, f) {
        const that = this;
        return new Promise((resolve, reject) => {
            const userConfig = require('../dao/user');
            const url = userConfig.getUrl() + '/download/' + file;
            const r = request(url);
            const help = require('./help');
            const p = help.getDataPath();
            let received = 0;
            let total = 0;
            r.on('response', function (res) {
                total = parseInt(res.headers['content-length']);
                if (fs.existsSync(p + f)) {
                    if (total == fs.statSync(p + f).size) {
                        resolve(p + f);
                        r.abort();
                        return;
                    }
                }
                if (res.statusCode == 200) {
                    const re = res.pipe(fs.createWriteStream(p + f));
                    re.on('finish', () => {
                        resolve(p + f);
                    });
                    re.on('error', () => {
                        reject('文件失效!');
                    });
                } else {
                    reject('文件失效!');
                }
            });
            r.on('data', function (chunk) {
                received += chunk.length;
                const progressVal = received / total;
                Ext.getCmp('msg-bar').setProgress(`下载中(${that.formatSizeUnits(received) + ' to ' + that.formatSizeUnits(total)})...`, progressVal);
            });
            r.on('end', function () {
                Ext.getCmp('msg-bar').closeProgress();
            });
        });
    }

    showUpdate() {
        return marked(this.readFile(require('app-root-path').path + '/UPDATE.md'));
    }

    getVersion() {
        return require(require('app-root-path').path + '/package.json').version;
    }

    showHelp(file) {
        return marked(this.readFile(require('app-root-path').path + '/help/' + file));
    }

    formatSizeUnits(bytes) {
        if (bytes >= 1073741824) {
            bytes = (bytes / 1073741824).toFixed(2) + " GB";
        } else if (bytes >= 1048576) {
            bytes = (bytes / 1048576).toFixed(2) + " MB";
        } else if (bytes >= 1024) {
            bytes = (bytes / 1024).toFixed(2) + " KB";
        } else if (bytes > 1) {
            bytes = bytes + " bytes";
        } else if (bytes == 1) {
            bytes = bytes + " byte";
        } else {
            bytes = "0 bytes";
        }
        return bytes;
    }
}

module.exports = new Utils();
