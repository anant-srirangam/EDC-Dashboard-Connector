'use client';

import { useState, useEffect } from 'react';
import {Eye, Trash2, Plus, HelpCircle, Trash2Icon} from 'lucide-react';
import { ContractDefinition, AssetSelector } from '@/types/contract-definition';
import {Policy} from "@/types/policy";
import {fetchPoliciesApi} from "@/functions/policy";
import {fetchAssetsApi} from "@/functions/assets";
import RibbonHeader from "@/components/TitleRibbon";
import {Asset} from "@/types/assets";
import Select from "react-select";

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children}
      </div>
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-sm top-full left-0 mt-1 w-40 break-words">
          {text}
        </div>
      )}
    </div>
  );
};

export default function ContractDefinitionsPage() {
  const emptyContractDefinition : ContractDefinition = {
    '@id': '',
    accessPolicyId: '',
    contractPolicyId: '',
    assetsSelector: []
  }
  const [contractDefinitions, setContractDefinitions] = useState<ContractDefinition[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [edcOperators, setEdcOperators] = useState<string[]>([]);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContractDefinition, setSelectedContractDefinition] = useState<ContractDefinition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContractDefinition, setNewContractDefinition] = useState<ContractDefinition>(emptyContractDefinition);
  const [advancedModeEnabled, setAdvancedModeEnabled] = useState(false);

  useEffect(() => {
    fetchEdcOperators();
    fetchPolicies();
    fetchAssets();
    fetchContractDefinitions();
  }, []);

  const fetchContractDefinitions = async () => {
    try {
      const response = await fetch('/api/contract-definitions');
      const data = await response.json();
      setContractDefinitions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching contract definitions:', error);
      setContractDefinitions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    setPolicies(await fetchPoliciesApi());
  }

  const fetchAssets = async () => {
    setAssets(await fetchAssetsApi());
  }

  const fetchEdcOperators = async () => {
    try {
      const response = await fetch('/api/operators/edc');
      const data = await response.json();
      setEdcOperators(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching valid operators: ', error);
      setEdcOperators([]);
    }
  }

  const handleView = (contractDefinition: ContractDefinition) => {
    setSelectedContractDefinition(contractDefinition);
    setShowModal(true);
  };

  const handlePolicyView = async (policyId: string) => {
    try {
      const policy = await fetch(`/api/policies/${policyId}`)

      setSelectedPolicy(await policy.json());
      setShowPolicyModal(true);
    } catch (error) {
      console.error('Error fetching the requested policy', error);
    }

  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contract definition?')) {
      try {
        await fetch(`/api/contract-definitions?id=${id}`, { method: 'DELETE' });
        fetchContractDefinitions();
      } catch (error) {
        console.error('Error deleting contract definition:', error);
      }
    }
  };

  // add new row
  const handleAddRow = () => {
    setNewContractDefinition((prev) => ({
      ...prev,
      assetsSelector: [
        ...prev.assetsSelector,
        { leftOperand: "", operator: edcOperators[0], rightOperand: "" }, // new row object
      ],
    }));
  };

  // update row
  const handleRowChange = (index: number, field: keyof AssetSelector, value: string) => {
    const updatedRows = [...newContractDefinition.assetsSelector];
    updatedRows[index][field] = value;
    setNewContractDefinition((prev) => ({
      ...prev,
      assetsSelector: updatedRows,
    }));
  };

  // delete row
  const handleDeleteRow = (index: number) => {
    const updatedRows = newContractDefinition.assetsSelector.filter(
        (_, i) => i !== index
    );
    setNewContractDefinition((prev) => ({
      ...prev,
      assetsSelector: updatedRows,
    }));
  };

  const handleAssetMultiSelector = (selectedOptions: any) => {
    const selected = assets.filter(asset => selectedOptions?.some((o: any) => o.value === asset['@id']));
    setSelectedAssets(selected);

    setNewContractDefinition((prev) => ({
      ...prev,
      assetsSelector: []
    }));

    selected.map(asset => {
      setNewContractDefinition((prev) => ({
        ...prev,
        assetsSelector: [
            ...prev.assetsSelector,
            { leftOperand: "id", operator: "=", rightOperand: asset['@id'] }
        ]
      }));
    });
  };

  const handleCreate = async () => {
    try {
      await fetch('/api/contract-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContractDefinition)
      });
      setShowCreateModal(false);
      setNewContractDefinition(emptyContractDefinition);
      setSelectedAssets([]);
      fetchContractDefinitions();
    } catch (error) {
      console.error('Error creating contract definition:', error);
    }
  };

  // if (loading) {
  //   return <div className="flex justify-center items-center h-64">Loading...</div>;
  // }

  return (
      <div>
        <RibbonHeader
            title="Contract Definitions"
            actions={
              <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20}/>
                Add Contract Definition
              </button>
            }>
        </RibbonHeader>

        <div className="bg-gray-200 p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,max-content))] gap-6 justify-start">
            {contractDefinitions.map((cd) => {
              const gradientClass = 'from-blue-100 via-blue-200 to-blue-300';

              return (
                  <div
                      key={cd['@id']}
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
                    {/* Top: Contract Definition ID + action buttons */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="truncate">
                        <h3 className="text-md font-bold truncate">{cd['@id']}</h3>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col gap-3 text-sm">
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <span className="text-indigo-600">🔑</span> Access Policy
                        </div>
                        <div className="mt-1 text-gray-700 flex items-center gap-2">
                          {cd.accessPolicyId ? (
                              <>
                                <span className="truncate">{cd.accessPolicyId}</span>
                                <button
                                    onClick={() => handlePolicyView(cd.accessPolicyId)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View Access Policy"
                                >
                                  <Eye size={16} className={`transform hover:scale-150`}/>
                                </button>
                              </>
                          ) : (
                              <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p></p>
                      </div>

                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <span className="text-purple-600">📜</span> Contract Policy
                        </div>
                        <div className="mt-1 text-gray-700 flex items-center gap-2">
                          {cd.contractPolicyId ? (
                              <>
                                <span className="truncate">{cd.contractPolicyId}</span>
                                <button
                                    onClick={() => handlePolicyView(cd.contractPolicyId)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View Access Policy"
                                >
                                  <Eye size={16} className={`transform hover:scale-150`}/>
                                </button>
                              </>
                          ) : (
                              <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4 sm:mt-10 flex-shrink-0">
                        <button
                            onClick={() => handleView(cd)}
                            className="bg-white bg-opacity-30 hover:bg-opacity-100 p-2 rounded-md shadow-sm tooltip"
                            title="View Details"
                        >
                          <Eye size={24} className="text-gray-800"/> {/* bigger size */}
                        </button>
                        <button
                            onClick={() => handleDelete(cd['@id'])}
                            className="bg-red-700 bg-opacity-30 hover:bg-opacity-100 p-2 rounded-md shadow-sm tooltip"
                            title="Delete Asset"
                        >
                          <Trash2Icon size={24} className="text-red-200"/> {/* bigger size */}
                        </button>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* View Modal */}
        {showModal && selectedContractDefinition && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 overflow-y-auto max-h-full h-auto">
                <h2 className="text-xl font-bold mb-4">Contract Definition Details</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(selectedContractDefinition, null, 2)}
            </pre>
                <div className="mt-4 flex justify-end">
                  <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* View Policy Modal */}
        {showPolicyModal && selectedPolicy && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 overflow-y-auto max-h-full h-auto">
                <h2 className="text-xl font-bold mb-4">Policy Details</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(selectedPolicy, null, 2)}
            </pre>
                <div className="mt-4 flex justify-end">
                  <button
                      onClick={() => {setShowPolicyModal(false); setSelectedPolicy(null);}}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Create Modal */}
        {showCreateModal && edcOperators.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-wrap items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 overflow-x-auto overflow-y-auto max-h-full h-auto">
                <h2 className="text-xl font-bold mb-4">Create New Contract Definition</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Definition ID
                    </label>
                    <input
                        type="text"
                        value={newContractDefinition["@id"]}
                        onChange={(e) => setNewContractDefinition({
                          ...newContractDefinition,
                          '@id': e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter contract definition ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Policy ID
                    </label>
                    <select
                        value={newContractDefinition.accessPolicyId}
                        onChange={(e) => setNewContractDefinition({
                          ...newContractDefinition,
                          accessPolicyId: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option disabled value="">
                        Select policy
                      </option>
                      <option value="<None>">
                        &lt;None&gt;
                      </option>
                      {policies.map((policy) => (
                          <option key={policy["@id"]} value={policy["@id"]}>{policy["@id"]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Policy ID
                    </label>
                    <select
                        value={newContractDefinition.contractPolicyId}
                        onChange={(e) => setNewContractDefinition({
                          ...newContractDefinition,
                          contractPolicyId: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option disabled value="">
                        Select policy
                      </option>
                      <option value="<None>">
                        &lt;None&gt;
                      </option>
                      {policies.map((policy) => (
                          <option key={policy["@id"]} value={policy["@id"]}>{policy["@id"]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {/* Label on the left */}
                      <label className="text-sm font-medium text-gray-700">
                        Assets Selector
                      </label>

                      {/* Toggle on the right */}
                      <div
                          onClick={() => setAdvancedModeEnabled(!advancedModeEnabled)}
                          className={`relative pl-10 pr-10 h-8 rounded-full cursor-pointer transition-colors flex items-center justify-center ${
                              advancedModeEnabled ? "bg-green-500" : "bg-gray-300"
                          }`}
                      >
                        {/* Mode text always visible */}
                        <span className="relative z-10 text-white text-sm font-medium">
      {advancedModeEnabled ? "Advanced Mode" : "Basic Mode"}
    </span>

                        {/* Knob behind the text */}
                        <div
                            className={`absolute top-1 ${advancedModeEnabled ? "right-1" : "left-1"} bg-white w-6 h-6 rounded-full shadow-md transition-all`}
                        />
                      </div>
                    </div>


                    {!advancedModeEnabled && (<Select
                        isMulti
                        options={assets.map(asset => ({
                          value: asset["@id"],
                          label: asset?.properties?.name
                        }))}
                        value={selectedAssets.map(a => ({
                          value: a["@id"],
                          label: a?.properties?.name
                        }))}
                        onChange={handleAssetMultiSelector}
                    />)}

                    {/* Render rows */}
                    {advancedModeEnabled && (
                        <>
                          {newContractDefinition.assetsSelector.map((row, index) => (
                              <div key={index} className="flex flex-wrap gap-2 items-center mb-2">
                                <input
                                    type="text"
                                    placeholder="Left Operand"
                                    value={row.leftOperand}
                                    onChange={(e) =>
                                        handleRowChange(index, "leftOperand", e.target.value)
                                    }
                                    className="border rounded p-2 flex-1"
                                />

                                <select
                                    value={row.operator}
                                    onChange={(e) => handleRowChange(index, "operator", e.target.value)}
                                    className="border rounded p-2 w-32"
                                >
                                  <option disabled value="">
                                    Select operator
                                  </option>
                                  {edcOperators.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                  ))}
                                </select>

                                <input
                                    type="text"
                                    placeholder="Right Operand"
                                    value={row.rightOperand}
                                    onChange={(e) =>
                                        handleRowChange(index, "rightOperand", e.target.value)
                                    }
                                    className="border rounded p-2 flex-1"
                                />

                                <button
                                    type="button"
                                    onClick={() => handleDeleteRow(index)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                  -
                                </button>
                              </div>
                          ))}

                          <button
                              type="button"
                              onClick={handleAddRow}
                              className="bg-blue-500 text-white px-4 py-2 rounded"
                          >
                            + Add Row
                          </button>
                        </>
                    )}

                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewContractDefinition(emptyContractDefinition);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleCreate}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}