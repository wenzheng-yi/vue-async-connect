'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

function createAsyncConnect(options) {
    const { components, maxCalls = 20 } = options;
    const allConnects = ([]);
    const calledComponents = vue.shallowRef([]);
    function asyncCall(name, ...options) {
        const calledIndex = allConnects.findIndex((e) => e.name === name);
        if (calledIndex > -1) {
            const freeComponent = allConnects[calledIndex].receivers.find((e) => !e.flag.value);
            if (freeComponent) {
                freeComponent.trigger(...options);
            }
            else {
                allConnects[calledIndex].params.push(options);
                calledComponents.value[calledIndex].push(vue.defineAsyncComponent(components[name]));
                vue.triggerRef(calledComponents);
            }
            return;
        }
        const newConnect = {
            name,
            params: [options],
            receivers: []
        };
        allConnects.push(newConnect);
        calledComponents.value.push([vue.defineAsyncComponent(components[name])]);
        vue.triggerRef(calledComponents);
    }
    function defineReceive(options) {
        const { name, flag, trigger } = options;
        const connect = allConnects.find(e => e.name === name);
        connect.receivers.push({
            flag,
            trigger
        });
        vue.onMounted(() => {
            trigger(...connect.params.shift());
        });
    }
    const AsyncConnectRender = vue.defineComponent({
        setup() {
            vue.watch(() => {
                return calledComponents.value.flat().length;
            }, (cur, pre) => {
                if (cur > maxCalls) {
                    let freeConnectIndex = allConnects.findIndex((connect) => {
                        return connect.receivers.every((comp) => !comp.flag.value);
                    });
                    if (freeConnectIndex > -1) {
                        allConnects.splice(freeConnectIndex, 1);
                        calledComponents.value.splice(freeConnectIndex, 1);
                        vue.triggerRef(calledComponents);
                    }
                }
            }, {
                flush: 'post'
            });
            return {
                calledComponents
            };
        },
        render() {
            return this.calledComponents.flat().map(comp => vue.h(comp));
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
