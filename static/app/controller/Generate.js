Ext.define('OnionSpace.controller.Generate', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Generate',
    editType: 'edit',
    init: function () {
        this.control({
            'generate': {
                render: this.onPanelRendered
            },
            'toolbar button[action=edit]': {
                click: this.editFile
            },
            'toolbar button[action=preview]': {
                click: this.preview
            }
        });
    },
    onPanelRendered: function (dom) {
        const that = this;
        dom.codeEditor.changeValue = function () {
            const val = dom.codeEditor.codeEditor.getValue();
            if (that.editType == "edit") {
                execute('geFileData', 'setDataEdit', [dom.params.fileId, dom.pId, val]);
            } else {
                execute('geFileData', 'setDataPreview', [dom.params.fileId, dom.pId, val]);
            }
        };
    },
    editFile: function (btn) {
        this.editType = 'edit';
        const vsCode = btn.up('generate').down('minicode');
        const diffCode = btn.up('generate').down('diffcode');
        diffCode.hide();
        vsCode.show();
    },
    preview: function (btn) {
        const that = this;
        that.editType = 'view';
        const dom = btn.up('generate');
        const params = dom.params;
        const vsCode = dom.down('minicode');
        const diffCode = dom.down('diffcode');
        if (params.updateType == 'add') {
            dom.mask('处理中...');
            nodeRun(`compileTemplate('${params.fileId}')`).then(output => {
                diffCode.changeValue(output);
                vsCode.hide();
                diffCode.show();
                dom.unmask();
            }).catch(e => {
                dom.down('button[action=edit]').click();
                dom.unmask();
                console.error(e);
                showError(e);
            });
        } else {
            const {file} = execute('geFileData', 'getOneData', [params.fileId]);
            if (file.trim().length == 0) {
                that.editFile(btn);
                showError('Error 未设置修改文件,无法预览!');
                return;
            }
            dom.mask('处理中...');
            try {
                const tplFile = swig.compile(file);
                const f = tplFile(execute('controlData', 'getModuleData', [btn.up('generate').pId])).replace(/\\/g, '\/');
                const oldValue = require('fs').readFileSync(f, 'utf8').replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\`/g, '\\`');
                const d = jsCode.runNodeJs(`const content = \`${oldValue}\`;\n` + vsCode.codeEditor.getValue());
                if (d instanceof Promise) {
                    d.then(v => {
                        diffCode.changeValue(v, oldValue);
                        vsCode.hide();
                        diffCode.show();
                        dom.unmask();
                    }).catch(e => {
                        console.error(e);
                        dom.unmask();
                        dom.down('button[action=edit]').click();
                        showError(e);
                    });
                } else {
                    dom.unmask();
                    if (d != undefined) {
                        diffCode.changeValue(d, oldValue);
                        vsCode.hide();
                        diffCode.show();
                    }
                }
            } catch (e) {
                console.error(e);
                dom.unmask();
                dom.down('button[action=edit]').click();
                showError(e);
            }
        }
    },
    getContent: function (that) {
        const val = execute('geFileData', 'getOneData', [that.params.fileId]);
        let content = '';
        if (val != null) {
            content = val.content;
        }
        return content;
    }
});
