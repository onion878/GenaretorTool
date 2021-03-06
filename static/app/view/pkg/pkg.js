Ext.define('OnionSpace.view.pkg.pkg', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.pkg',
    requires: [
        'OnionSpace.controller.Pkg',
        'OnionSpace.store.Pkg'
    ],
    controller: 'Pkg',
    store: {
        type: 'Pkg'
    },
    viewModel: true,
    codeEditor: null,
    plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl: ['<p><b>描述:</b> {description}</p>']
    }],
    tbar: [{
        xtype: 'textfield',
        width: '100%',
        emptyText: '名称',
        action: 'search'
    }],
    initComponent: function () {
        const pId = this.pId, that = this;
        this.columns = [
            {text: '名称', align: 'center', dataIndex: 'name', flex: 1},
            {text: '最新版本', align: 'center', dataIndex: 'version', flex: 1},
            {
                text: '更新日期', align: 'center', dataIndex: 'date', flex: 1, renderer: function (v) {
                    return v.substring(0, 10);
                }
            },
            {
                xtype: 'actioncolumn',
                width: 80,
                sortable: false,
                text: '操作',
                align: 'center',
                items: [{
                    icon: 'images/data-add.svg',
                    tooltip: '安装最新版',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        Ext.toast({
                            html: '安装中...',
                            closable: false,
                            align: 't',
                            slideInDuration: 400
                        });
                        jsCode.savePkg(pId, data.name, data.version);
                        that.installPkg(pId, data.name, data.version);
                    }
                }, {
                    icon: 'images/other-database.svg',
                    tooltip: '安装其它版本',
                    handler: function (view, recIndex, cellIndex, item, e, {data}) {
                        const el = this.up('pkg').getEl();
                        showPrompt('输入版本号', '', function (text) {
                            Ext.toast({
                                html: '安装中...',
                                closable: false,
                                align: 't',
                                slideInDuration: 400
                            });
                            jsCode.savePkg(pId, data.name, text);
                            that.installPkg(pId, data.name, text);
                        }, this);
                    }
                }, {
                    icon: 'images/find.svg',
                    tooltip: '详情',
                    handler: function (view, recIndex, cellIndex, item, e, record) {
                        require("open")(record.data.links.npm);
                    }
                }]
            }
        ];
        this.callParent(arguments);
    },
    installPkg(pId, name, version) {
        if (version != undefined) {
            name = name + '@' + version;
        }
        if (Ext.getCmp('terminal').hidden) {
            document.getElementById('terminal-btn').click();
            const folder = jsCode.getFolder(pId);
            command.cdTargetFolder(folder);
            command.write('npm install ' + name);
        } else {
            command.write('npm install ' + name);
        }
    }
});
