const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('data/gefile.json');
const gdb = low(adapter);

class GeFile {

    constructor() {
        gdb.defaults({
            data: [],
            swig: []
        }).write();
    }

    save(id, pId) {
        gdb.get('data')
            .push({
                id: id,
                pId: pId,
                file: '',
                content: null,
                preview: null
            })
            .write();
    }

    setDataEdit(id, pId, content) {
        const v = this.getOneData(id);
        if (v != undefined) {
            gdb.get('data').find({
                id: id
            })
                .set('content', content)
                .write();
        } else {
            gdb.get('data')
                .push({
                    id: id,
                    pId: pId,
                    file: '',
                    content: content,
                    preview: null
                })
                .write();
        }
    }

    setDataPreview(id, pId, preview) {
        const v = this.getOneData(id);
        if (v != undefined) {
            gdb.get('data').find({
                id: id
            })
                .set('preview', preview)
                .write();
        } else {
            gdb.get('data')
                .push({
                    id: id,
                    pId: pId,
                    file: '',
                    content: null,
                    preview: preview
                })
                .write();
        }
    }

    getOneData(id) {
        return gdb.get('data').find({
            id: id
        }).value();
    }

    removeData(id) {
        gdb.get('data')
            .remove({
                id: id
            })
            .write();
    }

    updateDataFile(id, file) {
        gdb.get('data')
            .find({
                id: id
            })
            .set('file', file)
            .write();
    }

    getFileData(pId) {
        return gdb.get('data')
            .filter({
                pId: pId
            }).value();
    }

    getFileSwig(pId) {
        return gdb.get('swig')
            .filter({
                pId: pId
            }).value();
    }

    addAllData({data, swig}) {
        const oldData = gdb.get('data').value();
        const newData = oldData.concat(data);
        gdb.set('data', newData).write();
        swig.forEach(s => {
            gdb.get('swig').push(s).write();
        });
    }

    removeAll(pId) {
        gdb.get('data')
            .remove({pId: pId})
            .write();
    }

    getSwig(pId) {
        let v = gdb.get('swig').find({pId: pId}).value();
        if (v != undefined) {
            v = v.content;
        } else {
            v = '';
        }
        return v;
    }

    setSwig(pId, content) {
        const v = gdb.get('swig').find({pId: pId});
        if (v.value() === undefined) {
            gdb.get('swig').push({pId: pId, content: content}).write();
        } else {
            v.set('content', content).write();
        }
    }
}

module.exports = new GeFile();