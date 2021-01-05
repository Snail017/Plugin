import Vue from 'vue';
import Message from './components/message'
import BrowerOpens from './components/BrowserOpens'
import Wechat from './components/Wechat'
import MessageBox from './message-box/index.js';
import { isVNode } from '@/dialog/utils/vdom';
let msgQueue = [];

// 插件安装
// 弹框默认配置选项，传入字符串默认为无标题的简单提示，合并配置选项和构造实例
const showSuccessMsg = config => {
    CloseDialog(document.querySelectorAll('.dialog.message'))
    let options = {
        messageData: {
            message: '系统提示',
            type: 1,  // -1 delete; 1 success ; 2 loading
        },
    };
    Dialog(config, options, Message)
    setTimeout(() => {
        CloseDialog(document.querySelectorAll('.dialog.message'))
    }, 3000);
};
const showFailMsg = config => {
    CloseDialog(document.querySelectorAll('.dialog.message'))
    let options = {
        messageData: {
            message: '系统提示',
            type: -1,  // -1 delete; 1 success ; 2 loading
        },
    };
    Dialog(config, options, Message)
    setTimeout(() => {
        CloseDialog(document.querySelectorAll('.dialog.message'))
    }, 3000);
};
const showTransMsg = config => {
    CloseDialog(document.querySelectorAll('.dialog.message'))
    let options = {
        messageData: {
            message: '系统提示',
            type: 2,  // -1 delete; 1 success ; 2 loading
        },
    };
    Dialog(config, options, Message)
};
const showTipMsg = config => {
    CloseDialog(document.querySelectorAll('.dialog.message'))
    let options = {
        messageData: {
            message: '系统提示',
            type: 0,  // -1 delete; 1 success ; 2 loading
        },
    };
    Dialog(config, options, Message)
    setTimeout(() => {
        CloseDialog(document.querySelectorAll('.dialog.message'))
    }, 3000);
};
const Dialog = (config, options, DOM) => {
    if (config && typeof config !== 'object' && DOM === Message) {
        options.messageData.message = config;
    }
    // 合并配置选项
    config = { ...options, ...config };

    let Tpl = Vue.extend(DOM); // 使用基础 Vue 构造器，创建一个子类
    let instance = new Tpl(); // 构造实例
    // 将模板的data替换成传入的配置选项
    for (let key in config) {
        if (config.hasOwnProperty(key)) instance.$data[key] = config[key];
    }
    // 直接在body生成一个DOM树
    document.body.appendChild(instance.$mount().$el);

};
const showBrower = (config) => {
    // 合并配置选项
    let options = null;
    Dialog(config, options, BrowerOpens)
};
const showWechat = (config) => {
    let options = {
        show: 'wechat'
    };
    typeof config == 'string' ? options.show = config : '';
    Dialog(config, options, Wechat)
};
// 删除弹框DOM节点
const CloseDialog = (dialogBox) => {
    msgQueue=[]
    if (dialogBox.length) {
        for (let i = 0; i < dialogBox.length; i++) {
            dialogBox[i].parentNode.removeChild(dialogBox[i]);
        }
    }
};

export default {
    install() {
        Vue.prototype.$showSuccessMsg = showSuccessMsg.bind(Vue);
        Vue.prototype.$showTransMsg = showTransMsg.bind(Vue);
        Vue.prototype.$showFailMsg = showFailMsg.bind(Vue);
        Vue.prototype.$showTipMsg = showTipMsg.bind(Vue);
        Vue.prototype.$showBrower = showBrower.bind(Vue);
        Vue.prototype.$showWechat = showWechat.bind(Vue);
        Vue.prototype.$msgbox = MessageBox;
        Vue.prototype.$showAlert = MessageBox.alert;
        Vue.prototype.$confirm = MessageBox.confirm;
        Vue.prototype.$prompt = MessageBox.prompt;
        Vue.prototype.$closeDialog = CloseDialog(document.querySelectorAll('.message'));
    }
}