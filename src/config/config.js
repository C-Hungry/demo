import Env from './env';

let config = {

    // //开发
    // //登录
    // commonBaseUrl: "http://192.168.1.254:9003",
    // //货主
    // consignerBaseUrl: "http://192.168.1.254:9001",
    // //承运商
    // shipperBaseUrl: "http://192.168.1.254:9002",
    // //TMS
    // tmsBaseUrl: "http://localhost/ZK.ITMS.WebApi",

    // 开发
    //登录
    commonBaseUrl: "http://192.168.1.254:9003",
    //货主
    consignerBaseUrl: "http://192.168.1.254:9001",
    //承运商
    shipperBaseUrl: "http://192.168.1.254:9002",
    //TMS
    tmsBaseUrl: "http://localhost/ZK.ITMS.WebApi",

    // //测试189
    // //登录
    // commonBaseUrl: "http://192.168.1.189:9003",
    // //货主
    // consignerBaseUrl: "http://192.168.1.189:9001",
    // //承运商
    // shipperBaseUrl: "http://192.168.1.111:9002",
    // //TMS
    // tmsBaseUrl: "http://localhost/ZK.ITMS.WebApi",

    // 正式
    // 货主
    // consignerBaseUrl: "http://39.105.79.219:9005",
    // 承运商
    // shipperBaseUrl: "http://39.105.79.219:9006",
    // 登录
    // commonBaseUrl: "http://39.105.79.219:9007",
    // TMS
    // tmsBaseUrl: "http://localhost/ZK.ITMS.WebApi",



    //密钥
    key: "carfreecarrier",
    env: Env
};


if(window.service && window.service.commonBaseUrl){
    config.commonBaseUrl = window.service.commonBaseUrl;
}
if(window.service && window.service.consignerBaseUrl){
    config.consignerBaseUrl = window.service.consignerBaseUrl;
}
if(window.service && window.service.shipperBaseUrl){
    config.shipperBaseUrl = window.service.shipperBaseUrl;
}
if(window.service && window.service.tmsBaseUrl){
    config.tmsBaseUrl = window.service.tmsBaseUrl;
}

export default config;