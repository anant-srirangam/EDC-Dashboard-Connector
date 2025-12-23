import {Dataset, Offer} from "@/types/catalog";
import {useState} from "react";
import {Policy} from "@/types/policy";
import BasicModalData from "@/components/catalog/BasicModalData";

type AssetModalProps = {
    selectedAsset: Dataset;
    setShowViewModal: (value: boolean) => void;
}

export default function AssetViewModal({selectedAsset, setShowViewModal}: AssetModalProps) {
    const offers = selectedAsset.offers;
    // Normalize: ensure offers is always an array
    const offerList = Array.isArray(offers) ? offers : [offers];

    const [expanded, setExpanded] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpanded(expanded === index ? null : index);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-white p-6 rounded-lg w-2/3 max-w-4xl h-auto max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Asset Details
                </h2>

                <div className="space-y-5">
                    <BasicModalData selectedAsset={selectedAsset} setShowViewModal={setShowViewModal} />
                    <div>
                        <label className="block text-sm font-semibold text-gray-800
    bg-gradient-to-r from-indigo-100 via-purple-300 to-blue-500
    px-3 py-1 rounded-md shadow-sm mb-2">
                            Offers
                        </label>

                        <div className="space-y-2">
                            {offerList.map((policy: Offer, index: number) => (
                                <div
                                    key={policy.id || index}
                                    className="border rounded-md shadow-sm"
                                >
                                    <button
                                        onClick={() => toggleExpand(index)}
                                        className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-800 rounded-t-md"
                                    >
    <span className="truncate">
        {policy.id || `Policy ${index + 1}`}
        </span>
                                        <span className="text-xs text-gray-500">
    {expanded === index ? "▲ Collapse" : "▼ Expand"}
    </span>
                                    </button>

                                    {expanded === index && (
                                        <pre
                                            className="bg-gray-100 text-sm text-gray-900 p-3 rounded-b-md overflow-x-auto">
            {JSON.stringify(policy, null, 2)}
            </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-right">
                    <button
                        onClick={() => setShowViewModal(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}