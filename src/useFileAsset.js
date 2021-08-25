"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = require("react");
const file_asset_1 = tslib_1.__importDefault(require("./file.asset"));
function useFileAsset(media, fileSystem) {
    const asset = react_1.useMemo(() => file_asset_1.default.create(media, fileSystem), []);
    const [info, setInfo] = react_1.useState(undefined);
    const state = react_1.useMemo(() => { return { info, asset }; }, [info, asset]);
    react_1.useEffect(() => {
        asset.on('change', (info) => {
            setInfo(info);
        });
        asset.getInfo().then(i => setInfo(i));
    }, []);
    return state;
}
exports.default = useFileAsset;
