'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

const asyncComponents = new Map();
function batchDefine(importObj) {
    for (let key in importObj) {
        let name = key.split('/').slice(-2).join('/');
        name = name.replace(/\.[^.]*$/, '');
        asyncComponents.set(name, importObj[key]);
    }
}

const allConnects = {};
const calledComponents = vue.shallowRef([]);
function asyncCall(name, options) {
    if (allConnects[name]) {
        const emptyIndex = allConnects[name].receiver.findIndex((e) => !e.tag.value);
        if (emptyIndex > -1) {
            allConnects[name].receiver[emptyIndex].start(options);
            return;
        }
    }
    else {
        allConnects[name] = {
            params: [],
            receiver: [],
            positions: []
        };
    }
    const target = allConnects[name];
    target.params.push(options);
    target.positions.push(calledComponents.value.length);
    calledComponents.value.push(vue.defineAsyncComponent(asyncComponents.get(name)));
    vue.triggerRef(calledComponents);
}

const AsyncConnectRender = vue.defineComponent({
    setup() {
        return {
            calledComponents
        };
    },
    render() {
        return [...this.calledComponents.map(e => vue.h(e))];
    }
});

function defineReceive({ port, tag, start }) {
    if (Array.isArray(tag)) {
        tag = vue.toRef(tag[0], tag[1]);
    }
    allConnects[port].receiver.push({
        tag,
        start
    });
    vue.onMounted(() => {
        start(allConnects[port].params.shift());
    });
}

exports.asyncCall = asyncCall;
exports.asyncComponents = asyncComponents;
exports.batchDefine = batchDefine;
exports["default"] = AsyncConnectRender;
exports.defineReceive = defineReceive;
