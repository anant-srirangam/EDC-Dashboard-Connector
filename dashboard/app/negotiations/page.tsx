'use client';
import {useState, useEffect} from 'react';
import jsonld from "jsonld";
import {Negotiation} from "@/types/contract";
import RibbonHeader from "@/components/TitleRibbon";
import {Eye, Trash, Trash2, TrashIcon} from "lucide-react";
import {NegotiationState} from "@/types/negotiations";
import NegotiationProgressModal from "@/components/negotiations/NegotiationStateModal";

export default function ContractNegotiations() {
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
    const [showStateModal, setShowStateModal] = useState(false);

    const stateStyles: Record<NegotiationState, string> = {
        FINALIZED: "bg-green-100 text-green-800",
        TERMINATED: "bg-red-100 text-red-800",
        REQUESTED: "bg-yellow-100 text-yellow-800",
        OFFERED: "bg-blue-100 text-blue-800",
        ACCEPTED: "bg-indigo-100 text-indigo-800",
        AGREED: "bg-emerald-100 text-emerald-800",
        VERIFIED: "bg-teal-100 text-teal-800",
    };

    useEffect(() => {
        fetchNegotiations();
    }, []);

    const fetchNegotiations = async () => {
        try {
            const response = await fetch(`/api/negotiations`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    const expandedNegotiations = await Promise.all(
                        data.map(async (rawResponse) => {
                            const expanded = await jsonld.expand(rawResponse);
                            return Object.assign(new Negotiation(), expanded[0]);
                        })
                    );

                    setNegotiations(expandedNegotiations);
                } else {
                    setNegotiations([]);
                }

            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
        }
    };

    const handleTerminate = async(negotiation: Negotiation) => {
        if (confirm('Are you sure you want to terminate this request?')) {
            try {
                const response = await fetch(`/api/negotiations/${negotiation?.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    fetchNegotiations();
                }
            } catch (error) {
                console.error('Error terminating negotiation:', error);
            }
        }
    }

    return (
        <div>
            <RibbonHeader
                title="Contract Negotiations"
            >
            </RibbonHeader>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negotiation
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counter
                            Party
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initiated
                            On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {negotiations.map((negotiation) => (
                        <tr key={negotiation['id']}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{negotiation.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{negotiation.counterPartyId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{negotiation.assetId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                  className={`px-3 py-1 rounded-full font-medium ${
                                      stateStyles[negotiation.state as NegotiationState] ||
                                      "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {negotiation.state}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {
                                    (() => {
                                        const timestamp = parseInt(negotiation.initatedOn);
                                        const date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
                                        return date.toLocaleDateString();
                                    })()
                                }
                            </td>
                            <td>
                                <div className="flex justify-items-center gap-x-4">
                                    <button
                                        onClick={() => (setShowStateModal(true), setSelectedNegotiation(negotiation))}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <Eye size={24} className={`transform hover:scale-150`}/>
                                    </button>
                                    <button
                                        onClick={() => (handleTerminate(negotiation))}
                                        className="text-red-600 hover:text-red-900 "
                                    >
                                        <Trash2 size={24} className={`transform hover:scale-150`}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {showStateModal && (
                    <NegotiationProgressModal
                        state={selectedNegotiation?.state!}
                        onClose={() => setShowStateModal(false)}
                    />
                )}
            </div>
        </div>
    );
}