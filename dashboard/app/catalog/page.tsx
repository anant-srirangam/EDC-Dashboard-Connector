'use client';
import {useState, useEffect} from 'react';
import {Catalog, Dataset, Provider, ProviderBuilder} from "@/types/catalog";
import NegotiationDataModal from "@/components/catalog/NegotiationDataModal";
import AssetViewModal from "@/components/catalog/AssetViewModal";
import {Eye, Handshake} from "lucide-react";
import {useRegistration} from '@/app/context/RegistrationContext';
import RibbonHeader from "@/components/TitleRibbon";
import jsonld from "jsonld";

export default function FederatedCatalog() {
    const [showViewModal, setShowViewModal] = useState(false);
    const [showNegotiationModal, setShowNegotiationModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Dataset | null>(null);
    const [assetProvider, setAssetProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [catalog, setCatalog] = useState<Catalog[]>([]);
    const {isRegistered, participantId, layoutLoading} = useRegistration();

    useEffect(() => {
        // fetchProviders();
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const res = await fetch(`/api/catalog/`);
            const rawData = await res.json();

            if (Array.isArray(rawData)) {
                const expandedCatalogs = await Promise.all(
                    rawData.map(async (rawCatalog) => {
                        const expanded = await jsonld.expand(rawCatalog);
                        return Object.assign(new Catalog(), expanded[0]);
                    })
                );

                setCatalog(expandedCatalogs);
            } else {
                setCatalog([]);
            }
        } catch (err) {
            console.error(`Failed to fetch catalog`, err);
            setCatalog([]); // fallback
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (asset: Dataset, catalog: Catalog) => {
        setShowViewModal(true);
        setSelectedAsset(asset);
        setAssetProvider(new ProviderBuilder().endpoint(catalog.originator).id(catalog.participantId).build());
    };

    const handleNegotiation = async (asset: Dataset, catalog: Catalog) => {
        setShowNegotiationModal(true);
        setSelectedAsset(asset);
        setAssetProvider(new ProviderBuilder().endpoint(catalog.originator).id(catalog.participantId).build());
    };

    const isSelf = (participant: string) => {
        return participant === participantId;
    }
    //
    // if (loading) {
    //     return <div className="flex justify-center items-center h-64">Loading assets...</div>;
    // }

    return (
        <div>
            <RibbonHeader
                title="Federated Catalog"
                actions={
                    <button
                        onClick={() => fetchCatalog()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                }>
            </RibbonHeader>

            <div className="bg-gray-200 p-6">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,max-content))] gap-6 justify-start">
                    {catalog.map((providerCatalog: Catalog) =>
                        !isSelf(providerCatalog.participantId) && providerCatalog.datasets?.map(asset => {
                            const gradientClass = 'from-indigo-400 via-indigo-500 to-indigo-600';

                            return (
                                <div
                                    key={asset.id}
                                    className={`bg-gradient-to-br ${gradientClass} text-white rounded-xl shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col p-4 max-w-full w-auto h-auto`}
                                >
                                    {/* Top: Name and ID */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                        <div className="truncate">
                                            <h3 className="text-lg font-bold truncate">{asset.name}</h3>
                                            <p className="text-s truncate">ID: {asset.id}</p>
                                        </div>
                                    </div>

                                    {/* Info section */}
                                    <div className="flex flex-col gap-3 text-sm mt-2">
                                        <div className="flex ">
                                            <span className="font-medium w-32">Content Type:</span>
                                            <span className="flex-1">{asset.contenttype || 'Unknown'}</span>
                                        </div>
                                        <div className="flex ">
                                            <span className="font-medium w-32">Created:</span>
                                            <span
                                                className="flex-1">{asset.createdAt ? new Date(parseInt(asset.createdAt)).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 mt-2 sm:mt-10 flex-shrink-0">
                                        {/* Eye button */}
                                        <button
                                            className="relative group bg-white bg-opacity-30 hover:bg-opacity-100 p-1.5 rounded-md shadow-sm"
                                            onClick={() => handleView(asset, providerCatalog)}>
                                            <Eye size={24} className="text-gray-800"/>
                                            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
                     bg-gray-800 text-white text-xs rounded px-2 py-1
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
      View Details
    </span>
                                        </button>

                                        {/* Handshake button */}
                                        <button
                                            className="relative group bg-green-500 bg-opacity-60 hover:bg-opacity-100 p-1.5 rounded-md shadow-sm "
                                            onClick={() => handleNegotiation(asset, providerCatalog)}>
                                            <Handshake size={24} className="text-gray-300"/>
                                            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
                     bg-gray-800 text-white text-xs rounded px-2 py-1
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
      Initiate Negotiation
    </span>
                                        </button>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* View Asset Modal */}
            {showViewModal && selectedAsset && (
                <AssetViewModal
                    selectedAsset={selectedAsset}
                    setShowViewModal={setShowViewModal}
                />
            )}

            {showNegotiationModal && selectedAsset && (
                <NegotiationDataModal
                    provider={assetProvider!}
                    selectedAsset={selectedAsset}
                    setShowViewModal={setShowNegotiationModal}
                />
            )}
        </div>
    );
}