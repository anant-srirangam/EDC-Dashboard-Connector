'use client';
import {useState, useEffect} from 'react';
import {Eye, Plus, Trash2Icon} from "lucide-react";
import RibbonHeader from "@/components/TitleRibbon";
import {Asset} from "@/types/assets";

const Tooltip = ({text, children}: { text: string; children: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block">
            <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                {children}
            </div>
            {show && (
                <div
                    className="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-sm top-full left-0 mt-1 w-40 break-words">
                    {text}
                </div>
            )}
        </div>
    );
};

const HelpIcon = ({helpText}: { helpText: string }) => (
    <Tooltip text={helpText}>
    <span
        className="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs text-gray-500 bg-gray-200 rounded-full cursor-help hover:bg-gray-300">
      ?
    </span>
    </Tooltip>
);

interface DataPlane {
    '@id': string;
    state: string;
    allowedSourceTypes: string;
}

export default function Assets() {
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const blankFormData = {
        assetID: '',
        name: '',
        contentType: '',
        description: '',
        version: '',
        dataAddress: {
            type: '',
            baseUrl: '',
            authKey: '',
            authCode: '',
            bucketName: '',
            region: '',
            accessKeyId: '',
            secretAccessKey: '',
            accountName: '',
            containerName: '',
            sasToken: '',
            path: '',
            projectId: '',
            serviceAccountKey: ''
        }
    }
    const [formData, setFormData] = useState(blankFormData);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [dataplanes, setDataplanes] = useState<DataPlane[]>([]);

    useEffect(() => {
        fetchAssets();
    }, []);

    useEffect(() => {
        if (showModal) {
            fetchDataplanes();
        }
    }, [showModal])

    useEffect(() => {
        if (dataplanes.length === 1) {
            setFormData(prev => ({
                ...prev,
                dataAddress: {
                    ...prev.dataAddress,
                    type: dataplanes[0].allowedSourceTypes
                }
            }));
        }
    }, [dataplanes]);

    const fetchAssets = async () => {
        try {
            const response = await fetch('/api/assets');
            if (response.ok) {
                const data = await response.json();
                setAssets(data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDataplanes = async () => {
        try {
            const response = await fetch('/api/dataplanes');
            if (response.ok) {
                const data = await response.json();
                setDataplanes(data);
            }
        } catch (error) {
            console.error('Error fetching dataplanes:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/assets', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchAssets();
                setShowModal(false);
                setFormData(blankFormData);
            }
        } catch (error) {
            console.error('Error creating asset:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        if (name.startsWith('dataAddress.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                dataAddress: {...formData.dataAddress, [field]: value}
            });
        } else {
            setFormData({...formData, [name]: value});
        }
    };

    const renderDataAddressFields = () => {
        const {type} = formData.dataAddress;

        switch (type) {
            case 'HttpData':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Base URL *
                                <HelpIcon
                                    helpText="The HTTP endpoint URL where the data can be accessed. Must be a valid HTTP/HTTPS URL."/>
                            </label>
                            <input type="url" name="dataAddress.baseUrl" value={formData.dataAddress.baseUrl}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Auth Key
                                <HelpIcon
                                    helpText="Optional authentication key name (e.g., 'Authorization', 'X-API-Key') for HTTP header authentication."/>
                            </label>
                            <input type="text" name="dataAddress.authKey" value={formData.dataAddress.authKey}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Auth Code
                                <HelpIcon
                                    helpText="Optional authentication value (e.g., Bearer token, API key value) that corresponds to the Auth Key."/>
                            </label>
                            <input type="text" name="dataAddress.authCode" value={formData.dataAddress.authCode}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                    </>
                );
            case 'AmazonS3':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Bucket Name *
                                <HelpIcon helpText="Name of the S3 bucket where the asset data is stored."/>
                            </label>
                            <input type="text" name="dataAddress.bucketName" value={formData.dataAddress.bucketName}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Region *
                                <HelpIcon
                                    helpText="AWS region where the S3 bucket is located (e.g., us-east-1, eu-west-1)."/>
                            </label>
                            <input type="text" name="dataAddress.region" value={formData.dataAddress.region}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Access Key ID *
                                <HelpIcon helpText="AWS access key ID for authentication to access the S3 bucket."/>
                            </label>
                            <input type="text" name="dataAddress.accessKeyId" value={formData.dataAddress.accessKeyId}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Secret Access Key *
                                <HelpIcon
                                    helpText="AWS secret access key corresponding to the access key ID for S3 authentication."/>
                            </label>
                            <input type="password" name="dataAddress.secretAccessKey"
                                   value={formData.dataAddress.secretAccessKey} onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                    </>
                );
            case 'AzureStorage':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Account Name *
                                <HelpIcon helpText="Azure Storage account name where the asset data is stored."/>
                            </label>
                            <input type="text" name="dataAddress.accountName" value={formData.dataAddress.accountName}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Container Name *
                                <HelpIcon helpText="Name of the Azure Storage container that holds the asset data."/>
                            </label>
                            <input type="text" name="dataAddress.containerName"
                                   value={formData.dataAddress.containerName} onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                SAS Token *
                                <HelpIcon
                                    helpText="Shared Access Signature token for secure access to the Azure Storage container."/>
                            </label>
                            <input type="password" name="dataAddress.sasToken" value={formData.dataAddress.sasToken}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                    </>
                );
            case 'File':
                return (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            File Path *
                            <HelpIcon
                                helpText="Full file system path to the asset data file on the local or network file system."/>
                        </label>
                        <input type="text" name="dataAddress.path" value={formData.dataAddress.path}
                               onChange={handleInputChange}
                               className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                               required/>
                    </div>
                );
            case 'IonosS3':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Bucket Name *
                                <HelpIcon helpText="Name of the IONOS S3 bucket where the asset data is stored."/>
                            </label>
                            <input type="text" name="dataAddress.bucketName" value={formData.dataAddress.bucketName}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Region *
                                <HelpIcon helpText="IONOS region where the S3 bucket is located."/>
                            </label>
                            <input type="text" name="dataAddress.region" value={formData.dataAddress.region}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Access Key ID *
                                <HelpIcon helpText="IONOS access key ID for authentication to access the S3 bucket."/>
                            </label>
                            <input type="text" name="dataAddress.accessKeyId" value={formData.dataAddress.accessKeyId}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Secret Access Key *
                                <HelpIcon
                                    helpText="IONOS secret access key corresponding to the access key ID for S3 authentication."/>
                            </label>
                            <input type="password" name="dataAddress.secretAccessKey"
                                   value={formData.dataAddress.secretAccessKey} onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                    </>
                );
            case 'GoogleCloudStorage':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Bucket Name *
                                <HelpIcon
                                    helpText="Name of the Google Cloud Storage bucket where the asset data is stored."/>
                            </label>
                            <input type="text" name="dataAddress.bucketName" value={formData.dataAddress.bucketName}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Project ID *
                                <HelpIcon
                                    helpText="Google Cloud Project ID where the Cloud Storage bucket is located."/>
                            </label>
                            <input type="text" name="dataAddress.projectId" value={formData.dataAddress.projectId}
                                   onChange={handleInputChange}
                                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   required/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Service Account Key *
                                <HelpIcon
                                    helpText="JSON service account key for authentication to Google Cloud Storage. Paste the entire JSON content here."/>
                            </label>
                            <textarea name="dataAddress.serviceAccountKey"
                                      value={formData.dataAddress.serviceAccountKey} onChange={handleInputChange}
                                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows={3} required/>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    const handleDelete = async (assetId: string) => {
        try {
            const response = await fetch(`/api/assets?id=${assetId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchAssets();
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    };

    const handleView = async (assetId: string) => {
        try {
            const response = await fetch(`/api/assets/${assetId}`);
            if (response.ok) {
                const asset = await response.json();
                setSelectedAsset(asset);
                setShowViewModal(true);
            }
        } catch (error) {
            console.error('Error fetching asset details:', error);
        }
    };

    // if (loading) {
    //     return <div className="flex justify-center items-center h-64">Loading assets...</div>;
    // }

    return (
        <div>
            <RibbonHeader
                title="Assets"
                actions={
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-blue-700 transition"
                    >
                        <Plus size={20}/>
                        Add Asset
                    </button>
                }
            >
            </RibbonHeader>


            {/*<div className="bg-white rounded-lg shadow-md overflow-hidden">*/}
            {/*  <table className="min-w-full">*/}
            {/*    <thead className="bg-gray-50">*/}
            {/*      <tr>*/}
            {/*        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset ID</th>*/}
            {/*        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>*/}
            {/*        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Type</th>*/}
            {/*        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base URL</th>*/}
            {/*        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>*/}
            {/*        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>*/}
            {/*      </tr>*/}
            {/*    </thead>*/}
            {/*    <tbody className="bg-white divide-y divide-gray-200">*/}
            {/*      {assets.map((asset) => (*/}
            {/*        <tr key={asset['@id']}>*/}
            {/*          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset['@id']}</td>*/}
            {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.properties?.name || asset['@id']}</td>*/}
            {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.properties?.contenttype || 'Unknown'}</td>*/}
            {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{asset.dataAddress?.baseUrl || 'N/A'}</td>*/}
            {/*          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.properties?.createdAt ? new Date(parseInt(asset.properties.createdAt)).toLocaleDateString() : 'N/A'}</td>*/}
            {/*          <td className="px-6 py-4 whitespace-nowrap">*/}
            {/*            <button*/}
            {/*              onClick={() => handleView(asset['@id'])}*/}
            {/*              className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 mr-2"*/}
            {/*            >*/}
            {/*              View*/}
            {/*            </button>*/}
            {/*            <button*/}
            {/*              onClick={() => handleDelete(asset['@id'])}*/}
            {/*              className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"*/}
            {/*            >*/}
            {/*              Delete*/}
            {/*            </button>*/}
            {/*          </td>*/}
            {/*        </tr>*/}
            {/*      ))}*/}
            {/*    </tbody>*/}
            {/*  </table>*/}
            {/*</div>*/}

            <div className="bg-gray-200 p-6">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,max-content))] gap-6 justify-start">
                    {assets.map((asset) => {
                        const gradientClass = 'from-gray-100 via-gray-300 to-gray-700';

                        return (
                            <div
                                key={asset['@id']}
                                className={`
                                    bg-gradient-to-br ${gradientClass} 
                                    text-gray-800 
                                    rounded-2xl 
                                    shadow-black shadow-gray-500/100 
                                    hover:shadow-2xl hover:shadow-black
                                    transform hover:scale-105 
                                    transition-all duration-300 
                                    flex flex-col p-4 w-full max-w-xs min-h-[160px]
                                    border border-gray-200/30
                                    shadow-inner shadow-gray-200/20
                                  `}
                            >
                                {/* Top: Name and ID */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                    <div className="truncate">
                                        <h3 className="text-lg font-bold truncate">{asset.properties?.name}</h3>
                                        <p className="text-s truncate">ID : {asset['@id']}</p>
                                    </div>
                                </div>

                                {/* Info section */}
                                <div className="flex flex-col gap-3 text-sm mt-2">
                                    <div className="flex">
                                        <span className="font-medium w-32">Content Type:</span> {/* fixed width */}
                                        <span className="flex-1">{asset.properties?.contenttype || 'Unknown'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium w-32">Created:</span> {/* same fixed width */}
                                        <span className="flex-1">
      {asset.properties?.createdAt
          ? new Date(parseInt(asset.properties.createdAt)).toLocaleDateString()
          : 'N/A'}
    </span>
                                    </div>
                                </div>

                                <div className="flex space-x-2 mt-2 sm:mt-10 flex-shrink-0">
                                    <button
                                        onClick={() => handleView(asset['@id'])}
                                        className="bg-white bg-opacity-30 hover:bg-opacity-100 p-2 rounded-md shadow-sm tooltip"
                                        title="View Details"
                                    >
                                        <Eye size={24} className="text-gray-800"/> {/* bigger size */}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset['@id'])}
                                        className="bg-red-700 bg-opacity-30 hover:bg-opacity-100 p-2 rounded-md shadow-sm tooltip"
                                        title="Delete Asset"
                                    >
                                        <Trash2Icon size={24} className="text-red-200"/> {/* bigger size */}
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl h-full overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add New Asset</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Asset ID
                                    <HelpIcon
                                        helpText="Unique identifier for the asset. This will be used to reference the asset in contracts and transfers."/>
                                </label>
                                <input
                                    type="text"
                                    name="assetID"
                                    value={formData.assetID}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Name
                                    <HelpIcon
                                        helpText="Human-readable name for the asset. This will be displayed in catalogs and asset listings."/>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Description
                                    <HelpIcon
                                        helpText="Detailed description of the asset, its contents, and intended use. This helps consumers understand what data they're accessing."/>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Data Address Type
                                    <HelpIcon
                                        helpText="The type of data source where the asset is stored. This determines which connection parameters are required."/>
                                </label>
                                <select
                                    name="dataAddress.type"
                                    value={formData.dataAddress.type}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {
                                        dataplanes.map((dataplane) => (
                                            <option key={dataplane['@id']}
                                                    value={dataplane.allowedSourceTypes}>{dataplane.allowedSourceTypes}</option>
                                        ))
                                    }
                                    {/*<option value="HttpData">HTTP Data</option>*/}
                                    {/*<option value="AmazonS3">Amazon S3</option>*/}
                                    {/*<option value="AzureStorage">Azure Storage</option>*/}
                                    {/*<option value="File">File System</option>*/}
                                    {/*<option value="IonosS3">IONOS S3</option>*/}
                                    {/*<option value="GoogleCloudStorage">Google Cloud Storage</option>*/}
                                </select>
                            </div>
                            {renderDataAddressFields()}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Content Type
                                    <HelpIcon
                                        helpText="MIME type of the asset content. This helps consumers understand the data format and how to process it."/>
                                </label>
                                <select
                                    name="contentType"
                                    value={formData.contentType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select content type</option>
                                    <option value="text/plain">Plain Text</option>
                                    <option value="application/json">JSON</option>
                                    <option value="application/octet-stream">Blob</option>
                                    <option value="application/pdf">PDF</option>
                                    <option value="text/csv">CSV</option>
                                    <option value="application/xml">XML</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Version
                                    <HelpIcon
                                        helpText="Version number of the asset. Use semantic versioning (e.g., 1.0.0) to track asset updates and changes."/>
                                </label>
                                <input
                                    type="text"
                                    name="version"
                                    value={formData.version}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="1.0.0"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Add Asset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData(blankFormData);
                                    }}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Asset Modal */}
            {showViewModal && selectedAsset && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-2/3 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Asset Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Asset ID</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedAsset['@id']}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Properties</label>
                                <pre className="mt-1 text-sm text-gray-900 bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedAsset.properties, null, 2)}
                </pre>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Data Address</label>
                                <pre className="mt-1 text-sm text-gray-900 bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedAsset.dataAddress, null, 2)}
                </pre>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}