import { useState } from "react";
import {X} from "lucide-react";

interface ErrorModalProps {
    message: string;
    setShowViewModal: (value: boolean) => void;
}

export default function ErrorModal({ message, setShowViewModal }: ErrorModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-h-full h-auto overflow-y-auto overflow-x-auto max-w-full w-auto">

                {/* Header row with title + close button */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-red-600">Submission Failed</h2>
                    <button
                        onClick={() => setShowViewModal(false)}
                        className="bg-red-700 text-gray-50 px-4 py-2 hover:bg-gray-400 transition"
                    >
                        <X />
                    </button>
                </div>

                {/* Error message */}
                <p className="text-gray-800 mb-6">{message}</p>
            </div>
        </div>
    );
}
