declare module moby {
    export module info {
        interface AppInfo {
            locale?: LocaleDetails;
            url: string;
            version: string;
            build: string;
            bundle: string;
            id: string;
        }
        interface MiniappInfo {
            locale?: LocaleDetails;
            id: string;
            name: string;
            version: string;
            tags?: string[];
            url?: string;
        }
        interface LocaleDetails {
            currencyCode: string;
            currencySymbol: string;
            decimalSeparator: string;
            groupingSeparator: string;
            identifier: string;
            languageCode: string;
            regionCode: string;
        }
        function miniapp(): Promise<MiniappInfo>;
        function app(): Promise<AppInfo>;
        function sdk(): any;
    }
    export module auth {
        interface MobyToken {
            jwt?: JwtToken;
            info: TokenInfo;
            expire?: Date;
        }
        interface JwtToken {
            access_token: string;
            external_token: string;
            refresh_token: string;
            token_type: string;
            expire: string;
        }
        interface TokenInfo {
            type: string | null;
            uid: string;
        }
        interface StoredTokens {
            type: string | null;
            uid: string;
            phone?: string;
            url?: string;
            external: string[];
        }
        function parse_jwt(token: string): any;
        module user {
            function get_token(): Promise<MobyToken>;
            function is_token_exist(): Promise<boolean>;
            function logout(): Promise<boolean>;
            module sms {
                function login(number: string): Promise<boolean>;
                function request_code(): void;
                function confirm_code(code: string): Promise<boolean>;
            }
            module openid {
                function login(url: string): Promise<boolean>;
            }
        }
        module service {
            function is_token_exist(url: string): Promise<boolean>;
            function login(url: string): Promise<boolean>;
            function get_token(url: string): Promise<MobyToken>;
            function logout(url: string): Promise<boolean>;
        }
    }
    export module camera {
        function scan_qr(): Promise<string>;
        interface CardDetails {
            pan: string;
            month?: string;
            year?: string;
            name?: string;
        }
        function scan_emv(): Promise<CardDetails>;
        interface ImageDetails {
            data: string;
            width: number;
            height: number;
            format: string;
        }
        module photo {
            function shot(): Promise<ImageDetails>;
        }
        module stream {
            function start(handler: (image: ImageDetails) => void): Promise<void>;
            function stop(): Promise<boolean>;
        }
    }
    export module nfc {
        function open(handler: (data: any) => void): Promise<any>;
        function close(): Promise<any>;
        function exchange(capdu: string[]): Promise<any>;
    }
    export module vpn {
        module ipsec {
            function open(server: string, user: string, pass: string, secret: string, just_in_app: boolean): Promise<any>;
        }
        module ikev2 {
            function open(server: string, user: string, pass: string, remote_id: string, local_id: string, just_in_app: boolean): Promise<any>;
        }
        function close(): Promise<any>;
        function info(): Promise<any>;
    }
    export module geo {
        interface GeoPosition {
            latitude: number;
            longitude: number;
        }
        function get_position(): Promise<GeoPosition>;
    }
    export module sqlite {
        function run(sql: string): Promise<any>;
        function get(sql: string): Promise<any>;
        function all(sql: string): Promise<any>;
    }
    export module storage {
        function create(): Promise<boolean>;
        function drop(): Promise<boolean>;
        function lenght(): Promise<number>;
        function keys(): Promise<string[]>;
        function values(): Promise<string[]>;
        interface StorageItem {
            key: string;
            value: string;
        }
        function items(): Promise<StorageItem[]>;
        function includes(key: string): Promise<boolean>;
        function get(key: string): Promise<string | null>;
        function set(key: string, value: string): Promise<boolean>;
        function del(key: string): Promise<boolean>;
    }
    export module firebase {
        function get_token(): Promise<any>;
    }
    export module share {
        function link(data: string): Promise<any>;
        function text(data: string): Promise<any>;
        function image(data: string): Promise<any>;
        function file(data: string): Promise<any>;
    }
    export module miniapp {
        function get_init_data(): Promise<string>;
        function open(uuid: string, init_data: string, device_id: string): Promise<any>;
        function open_url(url: string, init_data: string): Promise<any>;
        function close(response_data: string): Promise<any>;
        function show(uuid: string, init_data: string, device_id: string): Promise<any>;
        function show_navbar(uuid: string, init_data: string, device_id: string): Promise<any>;
        function show_url(url: string, init_data: string): Promise<any>;
        function pop(to_root: boolean, response_data: string): Promise<any>;
        interface AppDetails {
            id: string;
            tags: string[];
            device_id?: string;
            name: string;
            version: string;
        }
        function get_installed_apps(): Promise<AppDetails[]>;
        function get_app_icon(uuid: string, type: string): Promise<string>;
    }
    export module marketplace {
        interface LinkedInfo {
            wearableId: string;
        }
        interface InstalledInfo {
            wearableId: string;
            installedVersionNumber: string;
            updateAvailable: boolean;
        }
        interface ProviderInfo {
            name: string;
            email: string;
            site: string;
            id: string;
            isDefault: boolean;
        }
        interface ProductTypes {
            id: number;
            name: string;
            iconUrl: string;
        }
        interface VirtualFeatures {
            isBoot: boolean;
            isDefault: boolean;
            menuIndex: number;
            sidebarIndex: number;
        }
        interface WearableFeatures {
            hasGeneralCommands: boolean;
            hasKeys: boolean;
            hasSystemCommands: boolean;
            hasJsCommands: boolean;
            hasSeCommands: boolean;
            hasFingerprint: boolean;
        }
        interface SupportedWearables {
            wearableId: string;
            versionNumber: string;
        }
        interface InfoDetails {
            iconUrl: string;
            id: string;
            created: string;
            provider: ProviderInfo;
            productTypes: ProductTypes[];
            comment: string;
            name: string;
            tags: string[];
            maxInstallationsCount: number;
            isVirtual: boolean;
            wearableFeatures: WearableFeatures;
            virtualFeatures: VirtualFeatures;
        }
        interface ProductInfo {
            lastVersion: string;
            availableInstallationSlotCount: number;
            linkedWith: LinkedInfo[];
            installedOn: InstalledInfo[];
            info: InfoDetails;
            supportedWearables: SupportedWearables[];
        }
        interface Products {
            totalCount: number;
            list: ProductInfo[];
        }
        function get_apps(from?: number, lenght?: number): Promise<Products>;
        module app {
            module sub {
                function install(): Promise<unknown>;
                function uninstall(): Promise<unknown>;
            }
            function about(id: string): ProductInfo | undefined;
            function purchase(product: ProductInfo, device_id: string): Promise<boolean>;
            function install(product: ProductInfo, device_id: string): Promise<boolean>;
            function update(product: ProductInfo, device_id: string): Promise<boolean>;
            function uninstall(product: ProductInfo, device_id: string): Promise<boolean>;
        }
    }
    export module devices {
        interface DeviceInfo {
            inner_id: string;
            is_virtual: boolean;
            device_id: string;
            name: string;
            uuid: string | null;
        }
        interface Datagram {
            session: number;
            data: string;
            number: number;
            encrypted: boolean;
        }
        function list(): Promise<DeviceInfo[]>;
        function scan(timeout: number, handler: (list: DeviceInfo[]) => void): Promise<DeviceInfo[]>;
        function add(data: any): Promise<boolean>;
        function del(device_id: string): Promise<boolean>;
        function exchange(device_id: string, uuid: string, timeout: number, data: Datagram[]): Promise<Datagram[]>;
        function script(device_id: string, product_id: string, type: string, variables: Object, subproduct_id?: string): Promise<boolean>;
        function connect(device_id: string, uuid: string): Promise<boolean>;
        function disconnect(device_id: string, uuid: string): Promise<boolean>;
    }
    export module utils {
        function hexstring_to_bytearray(hexString: string): any[];
        function bytearray_to_map(byteArray: number[]): any;
        function hexstring_to_map(hexString: string): any;
        function to_hex(string: string): string;
        function to_string(hex: string): string;
    }
    enum ApiMethod {
        AUTH = "AUTH",
        INFO = "INFO",
        SCAN_QR_CODE = "SCAN_QR_CODE",
        SCAN_BANK_CARD = "SCAN_BANK_CARD",
        GET_GEO = "GET_GEO",
        SQLITE = "SQLITE",
        VPN_SESSION = "VPN_SESSION",
        NFC_SESSION = "NFC_SESSION",
        NAVIGATION = "NAVIGATION",
        GET_INIT_DATA = "GET_INIT_DATA",
        GET_INSTALLED_APPS = "GET_INSTALLED_APPS",
        GET_APP_ICON = "GET_APP_ICON",
        SHARE_DATA = "SHARE_DATA",
        GET_LOCALE = "GET_LOCALE",
        MARKETPLACE = "MARKETPLACE",
        MOBY_DEVICES = "MOBY_DEVICES",
        FIREBASE = "FIREBASE",
        CAMERA = "CAMERA"
    }
    abstract class Decodable {
        static decode(from: Object): Object | null;
    }
    export class Error extends Decodable {
        readonly code: number;
        readonly description?: string;
        constructor(code: number, description?: string);
        static decode(from: any): Error | null;
    }
    export class Response {
        readonly result?: Decodable;
        readonly error?: Error;
        readonly id: number | undefined;
        constructor(nativeResponse: NativeResponse, decode?: (from: Object) => Decodable);
    }
    export class NativeResponse extends Decodable {
        readonly id: number;
        readonly result?: Object;
        readonly error?: Error;
        readonly more_msg?: boolean;
        constructor(id: number, result?: Object, error?: Error, more_msg?: boolean);
        static decode(from: any): NativeResponse | null;
    }
    export class jsbridge {
        static debug_mode: boolean;
        static emulator_mode: boolean;
        static emulate_response: boolean;
        private static _instance;
        private handlerManager;
        private osType;
        private static notifications;
        lastRequest: {
            method: ApiMethod;
            params: Object;
        };
        static get instance(): jsbridge;
        private sendToNative;
        static getOSType(): OSType;
        request(method: ApiMethod, params?: Object, handler?: (response: NativeResponse) => void): boolean;
        static log(message: string): void;
        registerEventHandler(handler?: (response: NativeResponse) => void): void;
        onResponse(object: Object): void;
        static notification(data: string): void;
        static get_notifications(): any;
    }
    enum OSType {
        UNDEFINED = 0,
        IOS = 1,
        ANDROID = 2,
        MACOS = 3
    }
    export {};
}
declare module MobylabsWallet {
    function nativeHandler(object: Object): void;
}
declare function init(): void;
