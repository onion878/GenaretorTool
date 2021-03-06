const help = require('../utils/help');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(help.getDataPath() + 'data/package.json');
const db = low(adapter);
const utils = require('../utils/utils');

class Package {

    constructor() {
        db.defaults({data: []}).write();
    }

    getAll(pId) {
        return db.get('data').filter({pId: pId}).value();
    }

    add(data) {
        const val = db.get('data').filter({name: data.name, pId: help.getPid()}).value();
        if (val.length == 0) {
            data.id = utils.getUUID();
            db.get('data')
                .push(data)
                .write();
        } else {
            data.id = val[0].id;
            db.get('data')
                .remove({id: data.id, pId: help.getPid()})
                .write();
            db.get('data')
                .push(data)
                .write();
        }
    }

    remove(pId, name) {
        db.get('data')
            .remove({pId: pId, name: name})
            .write();
    }

    addAllData({data}) {
        const oldData = db.get('data').value();
        const newData = oldData.concat(data);
        db.set('data', newData).write();
    }

    updateAll({data, pId}) {
        db.get('data')
            .remove({pId: pId})
            .write();
        db.set('data', db.get('data').value().concat(data))
            .write();
    }

    removeAll(pId) {
        db.get('data')
            .remove({pId: pId})
            .write();
    }
}

module.exports = new Package();
