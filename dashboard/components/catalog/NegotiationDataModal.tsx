import {Dataset, Provider} from "@/types/catalog";
import {useState} from "react";
import BasicModalData from "@/components/catalog/BasicModalData";
import NegotiationStateModal from "@/components/negotiations/NegotiationStateModal";
import {X} from "lucide-react";
import ErrorModal from "@/components/ErrorModal";
import {NegotiationState} from "@/types/negotiations";
import {JsonLdId} from "@/types/jsonld";
import jsonld from "jsonld";

type NegotiationModalProps = {
    provider: Provider;
    selectedAsset: Dataset;
    setShowViewModal: (show: boolean) => void;
}

export default function NegotiationDataModal({provider, selectedAsset, setShowViewModal}: NegotiationModalProps) {
    const offers = selectedAsset.offers;
    // Normalize: ensure offers is always an array
    const offerList = Array.isArray(offers) ? offers : [offers];
    const [selectedOfferIndex, setSelectedOfferIndex] = useState<number | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [error, setError] = useState<any | null>(null);

    const [showProgressModal, setShowProgressModal] = useState(false);
    const [negotiationState, setNegotiationState] = useState<NegotiationState>("REQUESTED");

    const [negotiationId, setNegotiationId] = useState<string | null>(null);

    // 🔹 Async request to initiate contract negotiation
    const initiateContractNegotiation = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const data = {
            provider: provider,
            asset: selectedAsset,
            offer: offerList[selectedOfferIndex!],
        };

        try {
            // Start request
            const response = await fetch("/api/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const res = await response.json();
            if (!response.ok) {
                throw new Error(res.error || "Failed to initiate negotiation");
            }

            const negResponseExpanded = await jsonld.expand(res);
            const negResponse = Object.assign(new JsonLdId(), negResponseExpanded[0]);

            // ✅ Show the modal
            setNegotiationId(negResponse.id); // assume your API returns an `id`
            setNegotiationState("REQUESTED");
            setShowProgressModal(true);

            // start polling for state updates
            pollNegotiationState(negResponse.id);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    // 🔹 Polling function — repeatedly fetch state until complete
    const pollNegotiationState = async (id: string) => {
        let done = false;

        while (!done) {
            try {
                const res = await fetch(`/api/contracts/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "State fetch failed");

                const currentState = data.state as typeof negotiationState;
                setNegotiationState(currentState);

                if (["FINALIZED", "TERMINATED"].includes(currentState)) {
                    done = true;
                }

                // Wait 2 seconds before next check
                await new Promise((resolve) => setTimeout(resolve));
            } catch (err) {
                console.error("Polling error:", err);
                done = true;
            }


        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={initiateContractNegotiation}>
                <div
                    className="bg-gradient-to-r from-blue-50 via-blue-100 to-white p-6 rounded-lg max-w-full w-auto h-[80vh] overflow-x-auto flex flex-col">
                    <div className="mt-4 mb-4 text-right">
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="bg-red-700 text-gray-50 px-4 py-2 hover:bg-gray-400 transition"
                        >
                            <X/>
                        </button>
                    </div>
                    <div className="flex flex-1 gap-6 overflow-hidden">
                        {/* Left side: Asset info + Offers dropdown */}
                        <div className="flex-1 overflow-y-auto space-y-5 pr-4">
                            {/* Asset fields */}
                            <BasicModalData selectedAsset={selectedAsset} setShowViewModal={setShowViewModal}/>

                            {/* Offers dropdown */}
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-800 bg-gradient-to-r from-indigo-100 via-purple-300 to-blue-500 px-3 py-1 rounded-md shadow-sm mb-2">
                                    Offers
                                </label>

                                <select
                                    className="w-full border rounded-md p-2"
                                    value={selectedOfferIndex ?? ""}
                                    onChange={(e) => setSelectedOfferIndex(Number(e.target.value))}
                                >
                                    <option value="" disabled>
                                        Select an offer
                                    </option>
                                    {offerList.map((offer: any, index: any) => (
                                        <option key={offer.id || index} value={index}>
                                            {offer.id || `Policy ${index + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right side: Offer details */}
                        <div className="w-3/5 bg-black p-4 rounded-md shadow-inner overflow-y-auto">
                            {selectedOfferIndex !== null ? (
                                <pre className="text-sm text-gray-200">
              {JSON.stringify(offerList[selectedOfferIndex], null, 2)}
            </pre>
                            ) : (
                                <p className="text-gray-200">Select an offer to see details</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-right ">
                        <button
                            type="submit"
                            className="text-gray-50 bg-green-700 px-4 py-2 hover:bg-gray-400 transition"
                        >
                            <div className="flex gap-x-2">
                                <span className="material-symbols-rounded text-[1.75rem]">handshake</span>
                                <span>Negotiate</span>
                            </div>
                        </button>
                    </div>

                </div>
            </form>
            {showProgressModal && negotiationId && (
                <NegotiationStateModal
                    state={negotiationState}
                    onClose={() => setShowProgressModal(false)}
                />
            )}

            {showError && (
                <ErrorModal message={error} setShowViewModal={setShowError} />
            )}
        </div>
    );
}