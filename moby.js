// import ky from 'ky';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
{ }
var moby;
(function (moby) {
    const version = "2.0.0.0-rc9"; // 22 Jul 2021
    function async_call(method, params, handler) {
        return new Promise(function (resolve, reject) {
            if (jsbridge === undefined || jsbridge === null)
                reject('implementation not available');
            if (jsbridge.instance === undefined || jsbridge.instance === null)
                reject('instance not available');
            jsbridge.instance.request(method, params, function (rv) {
                if (rv.error !== undefined) {
                    reject(rv.error);
                }
                else {
                    if (rv.more_msg !== undefined) {
                        if (jsbridge.debug_mode)
                            console.log('async_call( id:' + rv.id + ', more_msg: ' + rv.more_msg + " )");
                        if (handler) {
                            let e = handler(rv.result);
                            if (!rv.more_msg)
                                resolve(e === undefined ? rv.result : e);
                        }
                        else {
                            if (!rv.more_msg)
                                resolve(rv.result); // Completed                                
                        }
                    }
                    else {
                        if (handler) {
                            let e = handler(rv.result);
                            resolve(e);
                        }
                        else {
                            resolve(rv.result); // Completed
                        }
                    }
                }
            });
        });
    }
    // INFO about env
    let info;
    (function (info) {
        let locale;
        function get_locale() {
            return __awaiter(this, void 0, void 0, function* () {
                if (locale === undefined) {
                    try {
                        locale = (yield async_call(ApiMethod.GET_LOCALE, null, null));
                    }
                    catch (_a) { }
                }
                return locale;
            });
        }
        function miniapp() {
            let params = {
                type: "miniapp",
            };
            return async_call(ApiMethod.INFO, params, (e) => __awaiter(this, void 0, void 0, function* () {
                e.locale = yield get_locale();
                return e;
            }));
        }
        info.miniapp = miniapp;
        function app() {
            let params = {
                type: "mobile",
            };
            return async_call(ApiMethod.INFO, params, (e) => __awaiter(this, void 0, void 0, function* () {
                e.locale = yield get_locale();
                return e;
            }));
        }
        info.app = app;
        function sdk() {
            const rv = {
                version: version,
            };
            return rv;
        }
        info.sdk = sdk;
    })(info = moby.info || (moby.info = {}));
    // export module test {
    //     export async function test() {
    //         const json = await ky.post('https://example.com', {json: {foo: true}}).json();
    //     }
    // }
    // AUTH command 
    let auth;
    (function (auth) {
        function parse_jwt(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        }
        auth.parse_jwt = parse_jwt;
        function is_token_expired(date) {
            try {
                return (date.getTime() < Date.now());
            }
            catch (_a) {
                return false;
            }
        }
        // get info about stored tokens in mobile 
        function get_info() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield async_call(ApiMethod.AUTH, { action: "info" }, (e) => {
                        if (e.type === undefined) {
                            e.type = null;
                            e.uid = "";
                        }
                        return e;
                    });
                }
                catch (_a) {
                    return { type: null, uid: "", external: [] };
                }
            });
        }
        // let request_token_count = 0;        
        function restore_token(data) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let params = {
                        action: "get_token",
                        data: data
                    };
                    return yield async_call(ApiMethod.AUTH, params, (e) => __awaiter(this, void 0, void 0, function* () {
                        // check to expire and if it required - refresh it before return
                        let rv = parse_jwt(e.access_token);
                        if (is_token_expired(new Date(rv["exp"] * 1000))) {
                            // try to refresh token because it expired
                            let params = {
                                action: "refresh",
                                data: data
                            };
                            e = (yield async_call(ApiMethod.AUTH, params, null));
                        }
                        return e;
                    }));
                }
                catch (error) {
                    return error;
                }
            });
        }
        let user;
        (function (user) {
            function get_token() {
                return __awaiter(this, void 0, void 0, function* () {
                    let token = { info: { type: null, uid: '' } };
                    try {
                        let stored = yield get_info();
                        if (stored.type !== null) {
                            token.info.type = stored.type;
                            token.info.uid = stored.uid;
                            // console.log(JSON.stringify(token));
                            let rt = yield restore_token(token.info);
                            if (rt.access_token) {
                                let rv = parse_jwt(rt.access_token);
                                token.jwt = rt;
                                token.expire = new Date(rv["exp"] * 1000);
                            }
                        }
                        return token;
                    }
                    catch (error) {
                        if (jsbridge.debug_mode)
                            console.log(JSON.stringify(error));
                        return token;
                        // return {info: {type: null, uid: ""}};
                    }
                });
            }
            user.get_token = get_token;
            // Do we have user authorisation at all before?
            function is_token_exist() {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        // if(token.info.type === null)
                        {
                            let stored = yield get_info();
                            if (stored.type === null)
                                return false;
                        }
                        return true;
                    }
                    catch (error) {
                    }
                    return false;
                });
            }
            user.is_token_exist = is_token_exist;
            function logout() {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        let rv = yield get_info();
                        if (rv.type === null) {
                            if (jsbridge.debug_mode)
                                console.log("user not authorised");
                            return false;
                        }
                        else {
                            if (jsbridge.debug_mode)
                                console.log("user authorised: " + rv.uid);
                        }
                        let params = {
                            action: "logout",
                            data: { type: rv.type, uid: rv.uid }
                        };
                        // not await reply, what is not correct
                        return async_call(ApiMethod.AUTH, params, (e) => {
                            if (jsbridge.debug_mode)
                                console.log("logout done");
                            // token = {info: {type: null, uid: ""}};
                            return true;
                        });
                        // BUGFIX: Android not revert correct reply
                        // token = {info: {type: null, uid: ""}};
                        // return true;
                    }
                    catch (error) {
                        return false;
                    }
                });
            }
            user.logout = logout;
            let sms;
            (function (sms) {
                let default_token;
                function is_number_valid(number) {
                    try {
                        if (number === undefined || number === null || number.length < 10)
                            return false;
                    }
                    catch (_a) {
                        return false;
                    }
                    return true;
                }
                function login(number) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (jsbridge.debug_mode)
                            console.log("login");
                        if (!is_number_valid(number)) {
                            if (jsbridge.debug_mode)
                                console.log("invalid phone number format");
                            return false;
                        }
                        try {
                            let rv = yield get_info();
                            if (rv.type !== null) {
                                if (jsbridge.debug_mode)
                                    console.log("please logout before new login");
                                return false;
                            }
                            let params = {
                                action: "login",
                                data: {
                                    type: "sms",
                                    uid: number
                                }
                            };
                            default_token = (yield async_call(ApiMethod.AUTH, params, null));
                            if (default_token["2FA"]) {
                                request_code();
                                return true;
                            }
                            return false;
                        }
                        catch (_a) {
                            return false;
                        }
                    });
                }
                sms.login = login;
                function request_code() {
                    let params = {
                        action: "request_code",
                        data: {
                            token: default_token
                        }
                    };
                    async_call(ApiMethod.AUTH, params, null);
                }
                sms.request_code = request_code;
                function confirm_code(code) {
                    let params = {
                        action: "confirm_code",
                        data: {
                            code: code,
                            token: default_token
                        }
                    };
                    return async_call(ApiMethod.AUTH, params, (e) => {
                        if (e.access_token) {
                            get_token();
                            return true;
                        }
                        return false;
                    });
                }
                sms.confirm_code = confirm_code;
            })(sms = user.sms || (user.sms = {}));
            let openid;
            (function (openid) {
                function login(url) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (jsbridge.debug_mode)
                            console.log("login");
                        try {
                            let rv = yield get_info();
                            if (rv.type !== null) {
                                if (jsbridge.debug_mode)
                                    console.log("please logout before new login");
                                return false;
                            }
                            let params = {
                                action: "login",
                                data: {
                                    type: "openid",
                                    url: url
                                }
                            };
                            return async_call(ApiMethod.AUTH, params, (e) => {
                                if (e.access_token) {
                                    get_token();
                                    return true;
                                }
                                return false;
                            });
                        }
                        catch (error) {
                            return false;
                        }
                    });
                }
                openid.login = login;
            })(openid = user.openid || (user.openid = {}));
        })(user = auth.user || (auth.user = {}));
        let service;
        (function (service) {
            // Do we have user authorisation at all before?
            function is_token_exist(url) {
                return __awaiter(this, void 0, void 0, function* () {
                    let rv = yield get_info();
                    return rv.external.includes(url);
                });
            }
            service.is_token_exist = is_token_exist;
            // Will show OpenID UI window
            function login(url) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (yield is_token_exist(url)) {
                        return true;
                    }
                    let params = {
                        action: "login",
                        data: {
                            type: "external",
                            url: url
                        }
                    };
                    return yield async_call(ApiMethod.AUTH, params, (e) => {
                        if (e.access_token !== undefined)
                            if (e.access_token.length > 3)
                                return true;
                        return false;
                    });
                });
            }
            service.login = login;
            // Return a valid token or with undefined jwt in error case 
            function get_token(url) {
                return __awaiter(this, void 0, void 0, function* () {
                    let token = { info: { type: "external", uid: url } };
                    try {
                        if (yield is_token_exist(url)) {
                            let rt = yield restore_token({ type: "external", uid: url });
                            if (rt.access_token) {
                                let rv = parse_jwt(rt.access_token);
                                token.jwt = rt;
                                token.expire = new Date(rv["exp"] * 1000);
                            }
                        }
                        else {
                            //    return
                        }
                    }
                    catch (error) {
                        if (jsbridge.debug_mode)
                            console.log(JSON.stringify(error));
                    }
                    return token;
                });
            }
            service.get_token = get_token;
            function logout(url) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (yield is_token_exist(url)) {
                        let params = {
                            action: "logout",
                            data: { type: "external", uid: url }
                        };
                        return async_call(ApiMethod.AUTH, params, (e) => {
                            return true;
                        });
                    }
                    if (jsbridge.debug_mode)
                        console.log("no found '" + url + "' in exist aithorisations");
                    return false;
                });
            }
            service.logout = logout;
        })(service = auth.service || (auth.service = {}));
    })(auth = moby.auth || (moby.auth = {}));
    // CAMERA features
    let camera;
    (function (camera) {
        function scan_qr() {
            return async_call(ApiMethod.SCAN_QR_CODE, null, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        camera.scan_qr = scan_qr;
        function scan_emv() {
            return async_call(ApiMethod.SCAN_BANK_CARD, null, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        camera.scan_emv = scan_emv;
        let photo;
        (function (photo) {
            function shot() {
                let params = {
                    action: "photo",
                    data: {
                        type: "environment", // or 'user'
                    }
                };
                return async_call(ApiMethod.CAMERA, params, (e) => {
                    return e;
                });
            }
            photo.shot = shot;
        })(photo = camera.photo || (camera.photo = {}));
        let stream;
        (function (stream) {
            function start(handler) {
                let params = {
                    action: "capture",
                    data: {
                        type: "environment",
                        fps: 12,
                        quality: 0.95,
                        width: 414,
                        script: 'window.buf.set([ value ]);',
                        placeholder: 'value'
                    }
                };
                return async_call(ApiMethod.CAMERA, params, handler);
            }
            stream.start = start;
            function stop() {
                let params = {
                    action: "stop",
                    data: {
                        type: "environment",
                    }
                };
                return async_call(ApiMethod.CAMERA, params, (e) => {
                    return e;
                });
            }
            stream.stop = stop;
        })(stream = camera.stream || (camera.stream = {}));
    })(camera = moby.camera || (moby.camera = {}));
    // NFC features
    let nfc;
    (function (nfc) {
        function open(handler) {
            let params = {
                action: "open",
            };
            return async_call(ApiMethod.NFC_SESSION, params, handler);
            // return async_call(ApiMethod.NFC_SESSION, params, (e: any) => {
            //     // prepare 'e' as you wish
            //     return e;
            // });
        }
        nfc.open = open;
        function close() {
            let params = {
                action: "close",
            };
            return async_call(ApiMethod.NFC_SESSION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        nfc.close = close;
        function exchange(capdu) {
            let params = {
                action: "cmd",
                apdu: capdu,
            };
            return async_call(ApiMethod.NFC_SESSION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        nfc.exchange = exchange;
    })(nfc = moby.nfc || (moby.nfc = {}));
    // VPN features
    let vpn;
    (function (vpn) {
        let ipsec;
        (function (ipsec) {
            function open(server, user, pass, secret, just_in_app) {
                let params = {
                    action: "connect",
                    type: "IPSec",
                    server: server,
                    username: user,
                    password: pass,
                    secret: secret,
                    inAppOnly: just_in_app
                };
                return async_call(ApiMethod.VPN_SESSION, params, (e) => {
                    // prepare 'e' as you wish
                    return e;
                });
            }
            ipsec.open = open;
        })(ipsec = vpn.ipsec || (vpn.ipsec = {}));
        let ikev2;
        (function (ikev2) {
            function open(server, user, pass, remote_id, local_id, just_in_app) {
                let params = {
                    action: "connect",
                    type: "IKEv2",
                    server: server,
                    username: user,
                    password: pass,
                    remoteId: remote_id,
                    localId: local_id,
                    inAppOnly: just_in_app
                };
                return async_call(ApiMethod.VPN_SESSION, params, (e) => {
                    // prepare 'e' as you wish
                    return e;
                });
            }
            ikev2.open = open;
        })(ikev2 = vpn.ikev2 || (vpn.ikev2 = {}));
        function close() {
            let params = {
                action: "dicsonnect",
            };
            return async_call(ApiMethod.VPN_SESSION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        vpn.close = close;
        function info() {
            let params = {
                action: "test",
            };
            return async_call(ApiMethod.VPN_SESSION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        vpn.info = info;
    })(vpn = moby.vpn || (moby.vpn = {}));
    // GEO features
    let geo;
    (function (geo) {
        function get_position() {
            return async_call(ApiMethod.GET_GEO, null, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        geo.get_position = get_position;
    })(geo = moby.geo || (moby.geo = {}));
    // SQLITE features: Independent database in every miniapp
    let sqlite;
    (function (sqlite) {
        function run(sql) {
            let params = {
                action: "run",
                sql: sql
            };
            return async_call(ApiMethod.SQLITE, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        sqlite.run = run;
        function get(sql) {
            let params = {
                action: "get",
                sql: sql
            };
            return async_call(ApiMethod.SQLITE, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        sqlite.get = get;
        function all(sql) {
            let params = {
                action: "all",
                sql: sql
            };
            return async_call(ApiMethod.SQLITE, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        sqlite.all = all;
    })(sqlite = moby.sqlite || (moby.sqlite = {}));
    let storage;
    (function (storage) {
        // based on https://stackoverflow.com/questions/47237807/use-sqlite-as-a-keyvalue-store
        // 'kv' is name of table 
        function create() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const rv = yield moby.sqlite.run("CREATE TABLE IF NOT EXISTS kv (key text unique, value text)");
                    return true;
                }
                catch (error) {
                    console.log(error, 'sqlite setup');
                }
                return false;
            });
        }
        storage.create = create;
        function drop() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const rv = yield moby.sqlite.run("DROP TABLE IF EXISTS kv");
                    return true;
                }
                catch (error) {
                    console.log(error, 'sqlite setup');
                }
                return false;
            });
        }
        storage.drop = drop;
        function lenght() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const rv = yield moby.sqlite.get("SELECT COUNT(*) FROM kv");
                    return parseInt(rv[0]) || 0;
                }
                catch (error) {
                    console.log(error, 'sqlite get lenght');
                }
                return 0;
            });
        }
        storage.lenght = lenght;
        function keys() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const rv = yield moby.sqlite.all("SELECT key FROM kv");
                    let result = [];
                    rv.map((e) => { result.push(e[0]); });
                    return result || [];
                }
                catch (error) {
                    console.log(error, 'sqlite keys');
                }
                return [];
            });
        }
        storage.keys = keys;
        function values() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const rv = yield moby.sqlite.all("SELECT value FROM kv");
                    let result = [];
                    rv.map((e) => { result.push(e[0]); });
                    return result || [];
                }
                catch (error) {
                    console.log(error, 'sqlite values');
                }
                return [];
            });
        }
        storage.values = values;
        function items() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const rv = yield moby.sqlite.all("SELECT key, value FROM kv");
                    let result = [];
                    rv.map((e) => {
                        const v = { key: e[0], value: e[1] };
                        result.push(v);
                    });
                    return result || [];
                }
                catch (error) {
                    console.log(error, 'sqlite items');
                }
                return [];
            });
        }
        storage.items = items;
        function includes(key) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const req = "SELECT 1 FROM kv WHERE key = '" + key + "'";
                    const rv = yield moby.sqlite.get(req);
                    return (((rv === null || rv === void 0 ? void 0 : rv.length) || 0) > 0);
                }
                catch (error) {
                    console.log(error, 'sqlite includes');
                }
                return false;
            });
        }
        storage.includes = includes;
        function get(key) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const req = "SELECT value FROM kv WHERE key = '" + key + "'";
                    const rv = yield moby.sqlite.get(req);
                    return rv[0] || null;
                }
                catch (error) {
                    console.log(error, 'sqlite get');
                }
                return null;
            });
        }
        storage.get = get;
        function set(key, value) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const req = "REPLACE INTO kv (key, value) VALUES ('" + key + "','" + value + "')";
                    const rv = yield moby.sqlite.run(req);
                    return true;
                }
                catch (error) {
                    console.log(error, 'sqlite set');
                }
                return false;
            });
        }
        storage.set = set;
        function del(key) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const req = "DELETE FROM kv WHERE key = '" + key + "'";
                    const rv = yield moby.sqlite.run(req);
                    return true;
                }
                catch (error) {
                    console.log(error, 'sqlite del');
                }
                return false;
            });
        }
        storage.del = del;
    })(storage = moby.storage || (moby.storage = {}));
    let firebase;
    (function (firebase) {
        function get_token() {
            let params = {
                action: "get_token",
            };
            return async_call(ApiMethod.FIREBASE, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        firebase.get_token = get_token;
    })(firebase = moby.firebase || (moby.firebase = {}));
    // SHARE features
    let share;
    (function (share) {
        function link(data) {
            let params = [{
                    type: "link",
                    data: data
                }]; // TODO: can be as array of elements
            return async_call(ApiMethod.SHARE_DATA, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        share.link = link;
        function text(data) {
            let params = [{
                    type: "text",
                    data: data
                }]; // TODO: can be as array of elements
            return async_call(ApiMethod.SHARE_DATA, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        share.text = text;
        function image(data) {
            let params = [{
                    type: "image",
                    data: data
                }]; // TODO: can be as array of elements
            return async_call(ApiMethod.SHARE_DATA, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        share.image = image;
        function file(data) {
            let params = [{
                    type: "file",
                    data: data
                }]; // TODO: can be as array of elements
            return async_call(ApiMethod.SHARE_DATA, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        share.file = file;
    })(share = moby.share || (moby.share = {}));
    // NAVIGATION features
    let miniapp;
    (function (miniapp) {
        function get_init_data() {
            return async_call(ApiMethod.GET_INIT_DATA, null, null);
        }
        miniapp.get_init_data = get_init_data;
        function open(uuid, init_data, device_id) {
            let params = {
                action: "open",
                data: {
                    type: "modal",
                    navigation_bar_hidden: true,
                    id: uuid,
                    data: init_data,
                    device_id: device_id,
                    init_url: null,
                }
            };
            return async_call(ApiMethod.NAVIGATION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        miniapp.open = open;
        function open_url(url, init_data) {
            let params = {
                action: "open",
                data: {
                    type: "modal",
                    navigation_bar_hidden: true,
                    id: null,
                    data: init_data,
                    device_id: null,
                    init_url: url,
                }
            };
            return async_call(ApiMethod.NAVIGATION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        miniapp.open_url = open_url;
        function close(response_data) {
            let params = {
                action: "close",
                data: {
                    type: "dismiss",
                    navigation_bar_hidden: true,
                    data: response_data
                }
            };
            return async_call(ApiMethod.NAVIGATION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        miniapp.close = close;
        function show(uuid, init_data, device_id) {
            let params = {
                action: "open",
                data: {
                    type: "push",
                    navigation_bar_hidden: true,
                    id: uuid,
                    data: init_data,
                    device_id: device_id,
                    init_url: null,
                }
            };
            return async_call(ApiMethod.NAVIGATION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        miniapp.show = show;
        function show_navbar(uuid, init_data, device_id) {
            let params = {
                action: "open",
                data: {
                    type: "push",
                    navigation_bar_hidden: false,
                    id: uuid,
                    data: init_data,
                    device_id: device_id,
                    init_url: null,
                }
            };
            return async_call(ApiMethod.NAVIGATION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        miniapp.show_navbar = show_navbar;
        function show_url(url, init_data) {
            let params = {
                action: "open",
                data: {
                    type: "push",
                    navigation_bar_hidden: true,
                    id: null,
                    data: init_data,
                    device_id: null,
                    init_url: url,
                }
            };
            return async_call(ApiMethod.NAVIGATION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        miniapp.show_url = show_url;
        function pop(to_root, response_data) {
            let params = {
                action: "close",
                data: {
                    type: to_root ? "pop_to_root" : "pop",
                    navigation_bar_hidden: true,
                    data: response_data
                }
            };
            return async_call(ApiMethod.NAVIGATION, params, (e) => {
                // prepare 'e' as you wish
                return e;
            });
        }
        miniapp.pop = pop;
        function get_installed_apps() {
            return async_call(ApiMethod.GET_INSTALLED_APPS, null, null);
        }
        miniapp.get_installed_apps = get_installed_apps;
        function get_app_icon(uuid, type) {
            let params = {
                id: uuid,
                type: type
            };
            return async_call(ApiMethod.GET_APP_ICON, params, null);
        }
        miniapp.get_app_icon = get_app_icon;
    })(miniapp = moby.miniapp || (moby.miniapp = {}));
    // MARKETPLACE features
    let marketplace;
    (function (marketplace) {
        let products = { totalCount: 0, list: [] };
        // TODO: merge with this.products
        function merge_product_lists(list) {
            products = list;
        }
        // from & lenght used for pagination
        function get_apps(from, lenght) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const endpoint = (yield moby.info.app()).url;
                    if (!endpoint.includes("http")) {
                        if (jsbridge.debug_mode)
                            console.log("wrong endpoint");
                        return products;
                    }
                    if (!(yield moby.auth.user.is_token_exist())) {
                        if (jsbridge.debug_mode)
                            console.log("not allowed: not authorised user");
                        return products;
                    }
                    const token = yield moby.auth.user.get_token();
                    if (token && token.jwt) {
                        const headers = new Headers({
                            'Authorization': token.jwt.token_type + ' ' + token.jwt.access_token,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'api-version': '1.5',
                        });
                        let url = endpoint + '/customer/product';
                        if (from !== undefined || lenght !== undefined) {
                            url += "?from=" + from.toString();
                            url += (lenght !== undefined) ? "&length=" + lenght.toString() : '';
                        }
                        yield fetch(url, {
                            method: 'get',
                            headers: headers,
                        }).then(response => response.json()).then((rv) => {
                            // market = pr;
                            // console.log(market);
                            // console.log(market.list[0].info.name);                        
                            if (jsbridge.debug_mode)
                                console.log("products get done");
                            merge_product_lists(rv);
                            // return just requested range
                            return rv;
                        }).catch((err) => {
                            if (jsbridge.debug_mode)
                                console.log("products error: " + JSON.stringify(err));
                        });
                    }
                }
                catch (error) {
                }
                return products;
            });
        }
        marketplace.get_apps = get_apps;
        let app;
        (function (app) {
            // TODO: what about sub-products?
            let sub;
            (function (sub) {
                function install() {
                    // just for miniapp where is call
                    if (jsbridge.debug_mode)
                        console.log("sub install");
                    throw "not implemented";
                    let params = {
                        action: "install",
                        data: {
                            type: "sub",
                        }
                    };
                    return async_call(ApiMethod.MARKETPLACE, params, (e) => {
                        // prepare 'e' as you wish
                        return e;
                    });
                }
                sub.install = install;
                function uninstall() {
                    // just for miniapp where is call
                    if (jsbridge.debug_mode)
                        console.log("sub uninstall");
                    throw "not implemented";
                    let params = {
                        action: "uninstall",
                        data: {
                            type: "sub",
                        }
                    };
                    return async_call(ApiMethod.MARKETPLACE, params, (e) => {
                        // prepare 'e' as you wish
                        return e;
                    });
                }
                sub.uninstall = uninstall;
            })(sub = app.sub || (app.sub = {}));
            // TODO: add subproducts (installed and available) to reply
            function about(id) {
                // TODO: need to go to server 
                if (products.totalCount > 0) {
                    let rv = products.list.find((element, index, array) => {
                        if (element.info.id === id)
                            return element;
                    });
                    return rv;
                }
                else {
                    // TODO: 
                    return undefined;
                }
            }
            app.about = about;
            function purchase(product, device_id) {
                if (product === undefined || device_id === undefined) {
                    if (jsbridge.debug_mode)
                        console.log("purchase error: undefined params");
                    return;
                }
                console.log("purchase: " + product.info.id);
                let params = {
                    action: "purchase",
                    data: {
                        uuid: product.info.id,
                        device_id: device_id
                    }
                };
                return async_call(ApiMethod.MARKETPLACE, params, (e) => {
                    return (e !== undefined);
                });
            }
            app.purchase = purchase;
            function install(product, device_id) {
                if (product === undefined || device_id === undefined) {
                    if (jsbridge.debug_mode)
                        console.log("install error: undefined params");
                    return;
                }
                console.log("install: " + product.info.id);
                let params = {
                    action: "install",
                    data: {
                        type: null,
                        info: product,
                        device_id: device_id
                    }
                };
                return async_call(ApiMethod.MARKETPLACE, params, (e) => {
                    return (e !== undefined);
                });
            }
            app.install = install;
            function update(product, device_id) {
                if (product === undefined || device_id === undefined) {
                    if (jsbridge.debug_mode)
                        console.log("update error: undefined params");
                    return;
                }
                if (jsbridge.debug_mode)
                    console.log("update: " + product.info.id);
                let params = {
                    action: "update",
                    data: {
                        type: null,
                        info: product,
                        device_id: device_id
                    }
                };
                return async_call(ApiMethod.MARKETPLACE, params, (e) => {
                    return (e !== undefined);
                });
            }
            app.update = update;
            function uninstall(product, device_id) {
                if (product === undefined || device_id === undefined) {
                    if (jsbridge.debug_mode)
                        console.log("uninstall error: undefined params");
                    return;
                }
                if (jsbridge.debug_mode)
                    console.log("uninstall: " + product.info.id);
                let params = {
                    action: "uninstall",
                    data: {
                        type: null,
                        uuid: product.info.id,
                        device_id: device_id
                    }
                };
                return async_call(ApiMethod.MARKETPLACE, params, (e) => {
                    return (e !== undefined);
                });
            }
            app.uninstall = uninstall;
        })(app = marketplace.app || (marketplace.app = {}));
    })(marketplace = moby.marketplace || (moby.marketplace = {}));
    // MOBY_DEVICES features
    let devices;
    (function (devices) {
        // export interface DeviceInfo
        // {
        //     [{"name":"MobyID Lite","inner_id":"6404FD5354294ADF","uuid":"ECB0A793-85EC-E9F2-A088-F6F470607DE5"}]
        //     [{"inner_id":"VIRTUAL-495D3C9F-6BA8-4570-ACEC-5130074BB94B","is_virtual":true,"device_id":"dea12041-9ca4-45a8-811f-aa372f1702ef","name":"Virtual Wearable"}]          
        // }
        // Empty list just in case of unauthorised customer. Please ask customer to authorise. 
        function list() {
            let params = {
                action: "list",
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, (e) => {
                if (e.error !== undefined) {
                    return [];
                }
                return e;
            });
        }
        devices.list = list;
        function scan(timeout, handler) {
            let params = {
                action: "scan",
                data: {
                    timeout: timeout
                }
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, handler);
        }
        devices.scan = scan;
        function add(data) {
            let params = {
                action: "add",
                data: data
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, (e) => {
                return (e !== undefined);
            });
        }
        devices.add = add;
        function del(device_id) {
            let params = {
                action: "delete",
                data: {
                    device_id: device_id
                }
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, (e) => {
                return (e !== undefined);
            });
        }
        devices.del = del;
        function exchange(device_id, uuid, timeout, data) {
            let params = {
                action: "exchange",
                data: {
                    device_id: device_id,
                    uuid: uuid,
                    timeout: timeout,
                    datagram: data
                }
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, null);
        }
        devices.exchange = exchange;
        function script(device_id, product_id, type, variables, subproduct_id) {
            let params = {
                action: "script",
                data: {
                    device_id: device_id,
                    product_id: product_id,
                    type: type,
                    variables: variables,
                    service_api_subproduct_id: subproduct_id // serviceSubProductId
                }
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, (e) => {
                return (e !== undefined);
            });
        }
        devices.script = script;
        function connect(device_id, uuid) {
            let params = {
                action: "connect",
                data: {
                    device_id: device_id,
                    uuid: uuid,
                }
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, (e) => {
                return (e !== undefined);
            });
        }
        devices.connect = connect;
        function disconnect(device_id, uuid) {
            let params = {
                action: "disconnect",
                data: {
                    device_id: device_id,
                    uuid: uuid,
                }
            };
            return async_call(ApiMethod.MOBY_DEVICES, params, (e) => {
                return (e !== undefined);
            });
        }
        devices.disconnect = disconnect;
    })(devices = moby.devices || (moby.devices = {}));
    let utils;
    (function (utils) {
        function hexstring_to_bytearray(hexString) {
            let result = [];
            while (hexString.length >= 2) {
                result.push(parseInt(hexString.substring(0, 2), 16));
                hexString = hexString.substring(2, hexString.length);
            }
            return result;
        }
        utils.hexstring_to_bytearray = hexstring_to_bytearray;
        function bytearray_to_map(byteArray) {
            let result = {};
            while (byteArray.length >= 2) {
                var t = byteArray[0];
                var l = byteArray[1];
                byteArray = byteArray.slice(2);
                if (byteArray.length < l) {
                    break;
                }
                result[t] = byteArray.slice(0, l);
                byteArray = byteArray.slice(l);
            }
            return result;
        }
        utils.bytearray_to_map = bytearray_to_map;
        function hexstring_to_map(hexString) {
            let byteArray = hexstring_to_bytearray(hexString);
            return bytearray_to_map(byteArray);
        }
        utils.hexstring_to_map = hexstring_to_map;
        function to_hex(string) {
            let hex = '';
            for (var i = 0; i < string.length; i++) {
                if (i === 0)
                    hex += '' + string.charCodeAt(i).toString(16);
                else
                    hex += '-' + string.charCodeAt(i).toString(16);
            }
            return hex;
        }
        utils.to_hex = to_hex;
        function to_string(hex) {
            let nums = hex.split('-');
            var str = '';
            for (var i = 0; i < nums.length; i++)
                str += String.fromCharCode(parseInt(nums[i], 16));
            return str;
        }
        utils.to_string = to_string;
    })(utils = moby.utils || (moby.utils = {}));
    // declare module Android {
    //     export function mobylabsWalletJsBridge(data: string) : any;
    //     export function log(message: string) : any;
    // }
    let ApiMethod;
    (function (ApiMethod) {
        ApiMethod["AUTH"] = "AUTH";
        ApiMethod["INFO"] = "INFO";
        ApiMethod["SCAN_QR_CODE"] = "SCAN_QR_CODE";
        ApiMethod["SCAN_BANK_CARD"] = "SCAN_BANK_CARD";
        ApiMethod["GET_GEO"] = "GET_GEO";
        ApiMethod["SQLITE"] = "SQLITE";
        ApiMethod["VPN_SESSION"] = "VPN_SESSION";
        ApiMethod["NFC_SESSION"] = "NFC_SESSION";
        ApiMethod["NAVIGATION"] = "NAVIGATION";
        ApiMethod["GET_INIT_DATA"] = "GET_INIT_DATA";
        ApiMethod["GET_INSTALLED_APPS"] = "GET_INSTALLED_APPS";
        ApiMethod["GET_APP_ICON"] = "GET_APP_ICON";
        ApiMethod["SHARE_DATA"] = "SHARE_DATA";
        ApiMethod["GET_LOCALE"] = "GET_LOCALE";
        ApiMethod["MARKETPLACE"] = "MARKETPLACE";
        ApiMethod["MOBY_DEVICES"] = "MOBY_DEVICES";
        ApiMethod["FIREBASE"] = "FIREBASE";
        ApiMethod["CAMERA"] = "CAMERA";
    })(ApiMethod || (ApiMethod = {}));
    let ErrorCodes;
    (function (ErrorCodes) {
        ErrorCodes[ErrorCodes["undefined"] = 1] = "undefined";
        ErrorCodes[ErrorCodes["parse"] = 2] = "parse";
        ErrorCodes[ErrorCodes["invalidResponse"] = 3] = "invalidResponse";
    })(ErrorCodes || (ErrorCodes = {}));
    class Decodable {
        static decode(from) {
            return null;
        }
    }
    class Error extends Decodable {
        constructor(code, description) {
            super();
            this.code = code;
            this.description = description;
        }
        static decode(from) {
            if (from["code"]) {
                return new this(from["code"], from["description"]);
            }
            return null;
        }
    }
    moby.Error = Error;
    class Response {
        constructor(nativeResponse, decode) {
            if (!nativeResponse) {
                this.error = new Error(ErrorCodes.invalidResponse, "Invalid Response: no nativeResponse");
                return;
            }
            if (nativeResponse.error) {
                this.error = nativeResponse.error;
                return;
            }
            if (!nativeResponse.result) {
                this.error = new Error(ErrorCodes.invalidResponse, "Invalid Response: no result");
                return;
            }
            let value = (decode) ? decode(nativeResponse.result) : nativeResponse.result;
            if (!value) {
                this.error = new Error(ErrorCodes.parse, "Unable to parse result");
                return;
            }
            this.result = value;
        }
    }
    moby.Response = Response;
    class Encodable {
        encode() {
            return JSON.stringify(this, (key, value) => {
                if (null !== value)
                    return value;
            });
        }
    }
    class Request extends Encodable {
        constructor(method, params, id) {
            super();
            this.method = method;
            this.params = params;
            this.id = id;
        }
    }
    class NativeResponse extends Decodable {
        constructor(id, result, error, more_msg) {
            super();
            this.id = id;
            this.result = result;
            this.error = error;
            this.more_msg = more_msg;
        }
        static decode(from) {
            if (!from["id"]) {
                return null;
            }
            if (from["result"] === null || from["result"] === "") // TODO: this is not a normal
             {
                // console.warn("result(msg id=" + from["id"] + ") cann't be a null");
                return new this(from["id"], "success", undefined, from["more_msg"]);
            }
            if (from["result"]) {
                return new this(from["id"], from["result"], undefined, from["more_msg"]);
            }
            if (from["error"]) {
                let error = Error.decode(from["error"]);
                if (!error) {
                    return new this(0, undefined, new Error(ErrorCodes.parse, "Unable to parse NativeResponse: error"));
                }
                return new this(from["id"], undefined, from["error"]);
            }
            return new this(0, undefined, new Error(ErrorCodes.parse, "Unable to parse NativeResponse"));
        }
    }
    moby.NativeResponse = NativeResponse;
    class HandlerManager {
        constructor() {
            this.handlers = {};
            this.requestId = 0;
            this.magicId = 2147483647; //0x7FFFFFFF
            this.magicHandler = null;
        }
        generateRequestId() {
            if ((this.magicId - 1) === this.requestId) { //max int32 value - 1
                this.requestId = 0;
            }
            this.requestId += 1;
            return this.requestId;
        }
        register(handler) {
            let requestId = this.generateRequestId();
            const start = Date.now();
            this.handlers[requestId] = { handler, start };
            return requestId;
        }
        events(handler) {
            this.magicHandler = handler;
        }
        exec(object) {
            if (!object || !object["id"]) {
                return;
            }
            let nativeResponse = NativeResponse.decode(object);
            if (!nativeResponse) {
                return;
            }
            let handler = this.handlers[nativeResponse.id];
            if (handler) {
                if (jsbridge.debug_mode)
                    console.log("method( id:" + object["id"] + " ): " + (Date.now() - handler.start) + "ms");
                handler.handler(nativeResponse);
            }
            else {
                if (this.magicHandler && nativeResponse.id == this.magicId)
                    this.magicHandler(nativeResponse.result);
            }
            // TODO: check to more messages per this id
            if (nativeResponse.more_msg !== undefined) {
                if (!nativeResponse["more_msg"]) {
                    delete this.handlers[nativeResponse.id];
                }
            }
            else {
                delete this.handlers[nativeResponse.id];
            }
        }
    }
    class jsbridge {
        constructor() {
            this.handlerManager = new HandlerManager();
            this.osType = jsbridge.getOSType();
        }
        static get instance() {
            return this._instance || (this._instance = new this());
        }
        sendToNative(json) {
            if (jsbridge.debug_mode)
                console.log(">>: " + json);
            switch (this.osType) {
                case OSType.ANDROID:
                    window.Android.mobylabsWalletJsBridge(json);
                    break;
                case OSType.IOS:
                    window.webkit.messageHandlers.MobylabsWalletJsBridge.postMessage(json);
                    break;
                default:
                    // // console.log(json);
                    let e = JSON.parse(json);
                    let rv = { result: e, id: e.id };
                    // // let rv = {result: e, id: 2147483647};
                    // // console.log(JSON.stringify(rv));
                    if (jsbridge.emulate_response)
                        this.onResponse(rv);
                    // this.onResponse(rv);
                    // this.onResponse(rv);
                    break;
            }
        }
        static getOSType() {
            if (jsbridge.emulator_mode) {
                console.log("*** emulator_mode: " + jsbridge.emulator_mode);
                return OSType.UNDEFINED;
            }
            else {
                let userAgent = navigator.userAgent || navigator.vendor;
                if (jsbridge.debug_mode)
                    console.log(userAgent);
                if (/android/i.test(userAgent)) {
                    return OSType.ANDROID;
                }
                if (/iPad|iPhone|iPod/.test(userAgent) || userAgent.includes("Mac") && "ontouchend" in document) {
                    return OSType.IOS;
                }
                if (userAgent.includes("Mac"))
                    return OSType.MACOS;
                return OSType.UNDEFINED;
            }
        }
        // send request to native system
        request(method, params, handler) {
            const req = { method: method, params: params };
            switch (method) {
                case ApiMethod.NAVIGATION:
                case ApiMethod.SQLITE:
                case ApiMethod.CAMERA:
                case ApiMethod.NFC_SESSION:
                    {
                        if (JSON.stringify(this.lastRequest) === JSON.stringify(req)) // de-duplication requests
                            return false;
                    }
                    break;
            }
            let requestId = (null !== handler) ? this.handlerManager.register(handler) : null;
            let request = new Request(method, params, requestId);
            this.sendToNative(request.encode());
            this.lastRequest = req; // store a request to compare in next request for the de-duplication procedure
            return true;
        }
        // push log message via native system
        static log(message) {
            switch (moby.jsbridge.instance.osType) {
                case OSType.ANDROID:
                    window.Android.log(message);
                    break;
                case OSType.IOS:
                    window.webkit.messageHandlers.Log.postMessage(message);
                    break;
                default:
                    break;
            }
        }
        registerEventHandler(handler) {
            this.handlerManager.events(handler);
        }
        onResponse(object) {
            this.lastRequest = null;
            this.handlerManager.exec(object);
        }
        // NtfMessage
        // {
        //     type: string;
        //     data: string;
        // }
        static notification(data) {
            console.log("Ntf message '" + data["type"] + "': " + JSON.stringify(data["data"]));
            jsbridge.notifications.push(data);
        }
        static get_notifications() {
            return jsbridge.notifications;
        }
    }
    jsbridge.debug_mode = false;
    jsbridge.emulator_mode = false;
    jsbridge.emulate_response = false;
    jsbridge.notifications = [];
    moby.jsbridge = jsbridge;
    let OSType;
    (function (OSType) {
        OSType[OSType["UNDEFINED"] = 0] = "UNDEFINED";
        OSType[OSType["IOS"] = 1] = "IOS";
        OSType[OSType["ANDROID"] = 2] = "ANDROID";
        OSType[OSType["MACOS"] = 3] = "MACOS";
    })(OSType || (OSType = {}));
})(moby || (moby = {}));
// back compatibility
var MobylabsWallet;
(function (MobylabsWallet) {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function nativeHandler(object) {
        if (moby.jsbridge.debug_mode) {
            console.log("<<: " + JSON.stringify(object));
        }
        moby.jsbridge.instance.onResponse(object);
    }
    MobylabsWallet.nativeHandler = nativeHandler;
})(MobylabsWallet || (MobylabsWallet = {}));
// launch library on node / react projets
function init() {
    try {
        if (process.browser) {
            window.MobylabsWallet = MobylabsWallet;
            window.moby = moby;
            moby.storage.create();
            console.log("Moby.JS SDK v" + moby.info.sdk().version);
        }
    }
    catch (error) {
        window.MobylabsWallet = MobylabsWallet;
        window.moby = moby;
        moby.storage.create();
        console.log("Moby.JS SDK v" + moby.info.sdk().version);
    }
}
init();
