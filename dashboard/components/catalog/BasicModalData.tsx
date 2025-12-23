import {AssetModalProps} from "@/types/catalog";

export default function BasicModalData({selectedAsset, setShowViewModal}: AssetModalProps) {
    return (
        <>
            <div>
                <label className="block text-sm font-semibold text-gray-800 bg-gradient-to-r from-indigo-100 via-purple-300 to-blue-500 px-3 py-1 rounded-md shadow-sm mb-1">
                    Asset ID
                </label>

                <p className="mt-1 text-sm text-gray-900 break-words">
                    {selectedAsset.id}
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-800
            bg-gradient-to-r from-indigo-100 via-purple-300 to-blue-500
            px-3 py-1 rounded-md shadow-sm mb-1">
                    Asset Name
                </label>
                <p className="mt-1 text-sm text-gray-900 break-words">
                    {selectedAsset.name}
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-800
            bg-gradient-to-r from-indigo-100 via-purple-300 to-blue-500
            px-3 py-1 rounded-md shadow-sm mb-1">
                    Asset Description
                </label>
                <p className="mt-1 text-sm text-gray-900 break-words">
                    {selectedAsset.description}
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-800
            bg-gradient-to-r from-indigo-100 via-purple-300 to-blue-500
            px-3 py-1 rounded-md shadow-sm mb-1">
                    Asset Version
                </label>
                <p className="mt-1 text-sm text-gray-900 break-words">
                    {selectedAsset.version}
                </p>
            </div>
        </>
    );
}