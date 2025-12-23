'use client';

import {useState, useEffect, useRef} from 'react';
import {Eye, Trash2, Plus, HelpCircle, Trash2Icon} from 'lucide-react';
import { Policy } from '@/types/policy';
import {fetchPoliciesApi} from "@/functions/policy";
import RibbonHeader from "@/components/TitleRibbon";



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

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showObligationModal, setShowObligationModal] = useState(false);
  const [showProhibitionModal, setShowProhibitionModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const emptyPolicy = {
    policyID: '',
    policyPermissions: '',
    policyProhibitions: '',
    policyObligations: ''
  }
  const [newPolicy, setNewPolicy] = useState(emptyPolicy);
  const modalRef = useRef(null);
  const textareaRef = useRef(null);
  const [maxTextareaHeight, setMaxTextareaHeight] = useState(200);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (modalRef.current) {
      const modalHeight = modalRef.current.offsetHeight;
      setMaxTextareaHeight(modalHeight * 0.8);
    }
  }, [showCreateModal]);

  const fetchPolicies = async () => {
    setPolicies(await fetchPoliciesApi());
    setLoading(false);
  };

  const handleView = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      try {
        const response = await fetch(`/api/policies?id=${id}`, { method: 'DELETE' });
        if (response.ok) {await fetchPolicies();}
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  const handleCreate = async () => {
    try {
      await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      });
      setShowCreateModal(false);
      setNewPolicy(emptyPolicy);
      fetchPolicies();
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  // if (loading) {
  //   return <div className="flex justify-center items-center h-64">Loading...</div>;
  // }

  return (
    <div >
      <RibbonHeader
          title="Policies"
          actions={
            <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20}/>
              Add Policy
            </button>
          }
      >
      </RibbonHeader>

      <div className="bg-gray-200 p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,max-content))] gap-6 justify-start">
          {policies.map((policy) => {
            const gradientClass = 'from-yellow-200 via-yellow-300 to-yellow-400';

            return (
                <div
                    key={policy['@id']}
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
                  {/* Top: Policy ID & createdAt */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <div className="truncate">
                      <h3 className="text-md font-bold truncate">{policy['@id']}</h3>
                      <p className="text-xs text-gray-700">
                        {policy.createdAt ? new Date(parseInt(policy.createdAt)).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Permissions / Prohibitions / Obligations */}
                  <div className="flex flex-col gap-2 text-sm mt-2">
                    <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-1">
                <span className="text-green-600">✅</span> Permissions
              </span>
                      <button
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setShowPermissionModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} className={`transform hover:scale-150`}/>
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-1">
                <span className="text-red-600">🚫</span> Prohibitions
              </span>
                      <button
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setShowProhibitionModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} className={`transform hover:scale-150`}/>
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-1">
                <span className="text-yellow-700">📜</span> Obligations
              </span>
                      <button
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setShowObligationModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} className={`transform hover:scale-150`}/>
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 sm:mt-10 flex-shrink-0">
                    <button
                        onClick={() => handleView(policy)}
                        className="bg-white bg-opacity-30 hover:bg-opacity-100 p-2 rounded-md shadow-sm tooltip"
                        title="View Details"
                    >
                      <Eye size={24} className="text-gray-800"/> {/* bigger size */}
                    </button>
                    <button
                        onClick={() => handleDelete(policy['@id'])}
                        className="bg-red-700 bg-opacity-30 hover:bg-opacity-100 p-2 rounded-md shadow-sm tooltip"
                        title="Delete Policy"
                    >
                      <Trash2Icon size={24} className="text-red-200"/> {/* bigger size */}
                    </button>
                  </div>
                </div>
            );
          })}
        </div>
      </div>


      {/* View Modals */}
      {showPermissionModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 h-full overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Policy Permission Details</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(selectedPolicy.policy["odrl:permission"], null, 2)}
            </pre>
              <div className="mt-4 flex justify-end">
                <button
                    onClick={() => setShowPermissionModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
      )}
      {showProhibitionModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 h-full overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Policy Obligation Details</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(selectedPolicy.policy["odrl:prohibition"], null, 2)}
            </pre>
              <div className="mt-4 flex justify-end">
                <button
                    onClick={() => setShowProhibitionModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
      )}
      {showObligationModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 h-full overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Policy Obligation Details</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(selectedPolicy.policy["odrl:obligation"], null, 2)}
            </pre>
              <div className="mt-4 flex justify-end">
                <button
                    onClick={() => setShowObligationModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
      )}
      {showModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 h-full overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Policy Details</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(selectedPolicy, null, 2)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div ref={modalRef} className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Create New Policy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy ID
                </label>
                <input
                    type="text"
                    value={newPolicy.policyID}
                    onChange={(e) => setNewPolicy({...newPolicy, policyID: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter policy ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Permissions
                </label>
                <textarea
                    ref={textareaRef}
                    value={newPolicy.policyPermissions}
                    onChange={(e) => {
                      setNewPolicy({...newPolicy, policyPermissions: e.target.value})
                      e.target.style.height = "auto"; // reset
                      const newHeight = Math.min(
                          e.target.scrollHeight,
                          maxTextareaHeight
                      );
                      e.target.style.height = newHeight + "px";
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 overflow-y-auto"
                    placeholder="Enter policy definition"
                    style={{maxHeight: maxTextareaHeight}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Prohibitions
                </label>
                <textarea
                    ref={textareaRef}
                    value={newPolicy.policyProhibitions}
                    onChange={(e) => {
                      setNewPolicy({...newPolicy, policyProhibitions: e.target.value})
                      e.target.style.height = "auto"; // reset
                      const newHeight = Math.min(
                          e.target.scrollHeight,
                          maxTextareaHeight
                      );
                      e.target.style.height = newHeight + "px";
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 overflow-y-auto"
                    placeholder="Enter policy definition"
                    style={{maxHeight: maxTextareaHeight}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Obligations
                </label>
                <textarea
                    ref={textareaRef}
                    value={newPolicy.policyObligations}
                    onChange={(e) => {
                      setNewPolicy({...newPolicy, policyObligations: e.target.value})
                      e.target.style.height = "auto"; // reset
                      const newHeight = Math.min(
                          e.target.scrollHeight,
                          maxTextareaHeight
                      );
                      e.target.style.height = newHeight + "px";
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 overflow-y-auto"
                    placeholder="Enter policy definition"
                    style={{maxHeight: maxTextareaHeight}}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                  onClick={() => setShowCreateModal(false)}
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