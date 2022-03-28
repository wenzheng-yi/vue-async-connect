'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

function createAsyncConnect(options) {
    const { components, maxCalls = 20 } = options;
    const allConnects = vue.shallowRef([]);
    function asyncCall(name, triggerParam, option) {
        const _option = option || null;
        const freeComponent = allConnects.value.find((e) => e.name === name && e.receiver && !e.receiver.flag.value);
        if (freeComponent) {
            if (_option) {
                freeComponent.option = _option;
                vue.triggerRef(allConnects);
            }
            if (Array.isArray(triggerParam)) {
                freeComponent.receiver.trigger(...triggerParam);
            }
            else {
                freeComponent.receiver.trigger(triggerParam);
            }
            return;
        }
        const component = {
            name,
            params: triggerParam,
            receiver: null,
            option: _option,
            component: vue.defineAsyncComponent(components[name])
        };
        allConnects.value.push(component);
        vue.triggerRef(allConnects);
    }
    function defineReceive(options) {
        const { name, flag, trigger } = options;
        const target = allConnects.value.find((e) => e.name === name && e.receiver === null);
        target.receiver = {
            flag,
            trigger
        };
        vue.onMounted(() => {
            trigger(target.params);
            target.params = null;
        });
    }
    const AsyncConnectRender = vue.defineComponent({
        setup() {
            vue.watch(() => {
                return allConnects.value.length;
            }, (cur, pre) => {
                if (cur > maxCalls) {
                    allConnects.value = allConnects.value.filter((e) => !e.receiver || e.receiver.flag.value);
                }
            }, {
                flush: 'post'
            });
            return {
                allConnects
            };
        },
        render() {
            return this.allConnects.map((comp) => vue.h(comp.component, comp.option, () => { }));
        }
    });
    const Connect = {
        call: asyncCall,
        receive: defineReceive
    };
    return {
        connect: Connect,
        AsyncConnectRender
    };
}

function useBatchDefine(importObj) {
    let result = {};
    for (let key in importObj) {
        let name = key.split('/').slice(-2).join('/');
        name = name.replace(/\.[^.]*$/, '');
        result[name] = importObj[key];
    }
    return result;
}

exports.createAsyncConnect = createAsyncConnect;
exports.useBatchDefine = useBatchDefine;
