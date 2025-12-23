'use client';
import {useEffect, useState} from 'react';
import jsonld from "jsonld";
import {Contract, Negotiation, TransferState} from "@/types/contract";
import {Eye, Import, X} from "lucide-react";
import RibbonHeader from "@/components/TitleRibbon";
import {useRegistration} from "@/app/context/RegistrationContext";
import {DataAddress, TransferProcess} from "@/types/transferprocess";
import TransferProgressModal from "@/components/transfers/TransferStateModal";

export default function Contracts() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [selectedPolicyIndex, setSelectedPolicyIndex] = useState<number>(0);
    const [showViewModal, setShowViewModal] = useState(false);
    const {participantId} = useRegistration();
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [transferState, setTransferState] = useState<TransferState>(TransferState.NOT_INITIATED);
    const [transferStatusInternal, setTransferStatusInternal] = useState<string>("");
    const [transferInProcessId, setTransferInProcessId] = useState<string>("");
    const [title, setTitle] = useState<string>("");

    useEffect(() => {
        fetchContracts();
    }, []);

    useEffect(() => {
        if (transferState === TransferState.INITIATED)
            processTransfer();
    }, [transferState]);

    const fetchContracts = async () => {
        try {
            const response = await fetch(`/api/contracts`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    const expandedContracts = await Promise.all(
                        data.map(async (rawContract) => {
                            const expanded = await jsonld.expand(rawContract);
                            return Object.assign(new Contract(), expanded[0]);
                        })
                    );

                    setContracts(expandedContracts);
                } else {
                    setContracts([]);
                }

            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
        }
    };

    const initiateTransfer = async(contract: Contract) => {
        try {
            if (![TransferState.NOT_INITIATED, TransferState.COMPLETED, TransferState.FAILED].includes(transferState)) {
                alert("Another transfer already in process for current session. You can refresh the page to start a new session");
                return;
            }

            setTransferState(TransferState.PROCESSING_REQUEST);
            setTitle(`Data transfer in progress`);
            setShowProgressModal(true);

            let response = await fetch(`/api/negotiations/contracts/${contract.id}`, {
                method: 'GET'
            });

            if (response.ok) {
                const negotiations: [Negotiation] = await response.json();
                response = await fetch(`/api/transfers`, {
                    method: 'POST',
                    body: JSON.stringify({
                        negotiation: negotiations.pop()
                    })
                });

                if (response.ok) {
                    const trasnferProcess: TransferProcess = Object.assign(new TransferProcess(), (await jsonld.expand(await response.json()))[0]);
                    setTransferInProcessId(trasnferProcess.id);
                    setTitle(`Data transfer in progress with process ID : ${trasnferProcess.id}`);
                    pollTransferState(trasnferProcess.id);

                    return;
                }

                throw new Error(`Failed to intiate transfer: ${response.statusText}`);
            }

            throw new Error(`Failed to fetch contract: ${response.statusText}`);
        } catch (error) {
            console.error('Error initiating transfer:', error);
            setTransferState(TransferState.FAILED);
        }
    }

    const pollTransferState = async (id: string) => {
        let done = false;

        while (!done) {
            try {
                const res = await fetch(`/api/transfers/${id}`, {
                    method: 'GET'
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "State fetch failed");

                const currentState = data.state as string;
                console.log(currentState);

                setTransferStatusInternal(currentState);

                if ([TransferState.INITIATED.valueOf(), TransferState.FAILED.valueOf()].includes(currentState)) {
                    setTransferState(currentState as TransferState);
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

    const processTransfer = async() => {
        try {
            setTransferState(TransferState.AWAITING);
            let response = await fetch(`/api/transfers/edr/${transferInProcessId}`, {
                method: 'GET'
            });

            if (!response.ok) throw new Error(response.statusText);

            const dataddress: DataAddress = Object.assign(new DataAddress(), (await jsonld.expand(await response.json()))[0]);

            console.log(JSON.stringify(dataddress));

            response = await fetch(`/api/transfers/data`, {
                method: 'POST',
                body: JSON.stringify({
                    endpoint: dataddress.endpoint,
                    token: dataddress.authorization
                })
            });

            if (!response.ok) throw new Error(response.statusText);

            const blob = await response.blob();

            // Create a downloadable object URL
            const url = URL.createObjectURL(blob);

            // Trigger browser download
            const a = document.createElement("a");
            a.href = url;
            a.download = "data.json"; // filename
            document.body.appendChild(a);
            a.click();

            // Cleanup
            a.remove();
            URL.revokeObjectURL(url);

            setTransferState(TransferState.COMPLETED);

        } catch (error) {
            console.error('Error processing transfer:', error);
            setTransferState(TransferState.FAILED);
        }
    }


    return (
        <div>
            <RibbonHeader
                title="Contract Agreements"
            >
            </RibbonHeader>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto ">
                <table className="w-full min-w-max">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agreement
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signing
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                        <tr key={contract['id']}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.providerId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.consumerId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.assetId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => {
                                        setSelectedContract(contract);
                                        setShowViewModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <Eye size={24} className={`transform hover:scale-150`}/>
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {
                                    (() => {
                                        const timestamp = contract.signingDate;
                                        const date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
                                        return date.toLocaleDateString();
                                    })()
                                }
                            </td>
                            <td>
                                <button
                                    className="text-blue-600 hover:text-blue-900 flex items-center p-2 space-x-2 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                                    disabled={contract.providerId === participantId}
                                    onClick={() => {
                                        setSelectedContract(contract);
                                        initiateTransfer(contract);
                                    }}
                                >
                                    <Import size={24}>Initiate Data Transfer</Import>
                                    <span>Initiate Data Transfer</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {showViewModal && selectedContract && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 h-full overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold mb-4">Contract Policy Details</h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="bg-red-700 text-gray-50 px-4 py-2 hover:bg-gray-400 transition"
                                >
                                    <X/>
                                </button>
                            </div>
                            <div className="p-4">
                                <select
                                    className="w-full border rounded-md p-2 bg-gray-200"
                                    value={selectedPolicyIndex ?? ""}
                                    onChange={(e) => setSelectedPolicyIndex(Number(e.target.value))}
                                >
                                    <option value="" disabled>
                                        Select a policy
                                    </option>
                                    {selectedContract.policies?.map((policy: any, index: any) => (
                                        <option key={policy.id || index} value={index}>
                                            {policy.id || `Policy ${index + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-max-full w-auto bg-black p-4 rounded-md shadow-inner overflow-y-auto">
                                {selectedPolicyIndex !== null ? (
                                    <pre className="text-sm text-gray-200">
              {JSON.stringify(selectedContract.policies[selectedPolicyIndex], null, 2)}
            </pre>
                                ) : (
                                    <p className="text-gray-200">Select an offer to see details</p>
                                )}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showProgressModal && (
                <TransferProgressModal
                    title={title}
                    state={transferState}
                    internalStatus={transferStatusInternal}
                    onClose={() => {
                        setShowProgressModal(false);
                        if (transferState === TransferState.COMPLETED || transferState === TransferState.FAILED) {
                            setSelectedContract(null);
                            setTransferState(TransferState.NOT_INITIATED);
                        }
                    }}
                />
            )}
        </div>
    );
}