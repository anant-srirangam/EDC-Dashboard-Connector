import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import {NegotiationState} from "@/types/negotiations";

interface NegotiationProgressModalProps {
    state: NegotiationState;
    onClose: () => void;
}

const states: NegotiationState[] = [
    "REQUESTED",
    "OFFERED",
    "ACCEPTED",
    "AGREED",
    "VERIFIED",
    "FINALIZED",
];

export default function NegotiationProgressModal({
                                                     state,
                                                     onClose,
                                                 }: NegotiationProgressModalProps) {
    const currentIndex = states.indexOf(state);
    const progressPercent =
        state === "TERMINATED"
            ? 100
            : (currentIndex / (states.length - 1)) * 100;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-lg font-semibold mb-10 text-gray-800 text-center">
                    Contract Negotiation Progress
                </h2>

                {/* Timeline container */}
                <div className="relative w-full">
                    {/* Gray background line */}
                    <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full"></div>

                    {/* Animated green progress beam */}
                    <motion.div
                        className={`absolute top-4 left-0 h-1 rounded-full ${
                            state === "TERMINATED" ? "bg-red-500" : "bg-green-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />

                    {/* Milestones */}
                    <div className="flex justify-between relative z-10">
                        {states.map((s, i) => {
                            const isCompleted = i < currentIndex;
                            const isCurrent = i === currentIndex;
                            const isTerminated = state === "TERMINATED";

                            return (
                                <div key={s} className="flex flex-col items-center">
                                    {/* Circle */}
                                    <motion.div
                                        className={`flex items-center justify-center rounded-full border-2 h-10 w-10 relative
                      ${
                                            isTerminated
                                                ? "border-red-500 bg-red-100 text-red-600"
                                                : isCompleted
                                                    ? "border-green-500 bg-green-500 text-white"
                                                    : isCurrent
                                                        ? "border-green-400 bg-white text-green-500"
                                                        : "border-gray-300 bg-white text-gray-400"
                                        }`}
                                        animate={
                                            isCurrent && !isCompleted
                                                ? {
                                                    scale: [1, 1.15, 1],
                                                    boxShadow: [
                                                        "0 0 0px rgba(34,197,94,0)",
                                                        "0 0 12px rgba(34,197,94,0.6)",
                                                        "0 0 0px rgba(34,197,94,0)",
                                                    ],
                                                }
                                                : {}
                                        }
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <span className="text-sm font-semibold">
                        {i + 1}
                      </span>
                                        )}
                                    </motion.div>

                                    {/* Label */}
                                    <span
                                        className={`text-xs mt-3 font-medium text-center w-16 ${
                                            isTerminated
                                                ? "text-red-600"
                                                : isCompleted || isCurrent
                                                    ? "text-green-700"
                                                    : "text-gray-500"
                                        }`}
                                    >
                    {s}
                  </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status message */}
                <div className="mt-10 text-center">
                    {state === "TERMINATED" ? (
                        <p className="text-red-600 font-medium">
                            Negotiation terminated ❌
                        </p>
                    ) : state === "FINALIZED" ? (
                        <p className="text-green-600 font-medium">
                            Negotiation successfully finalized ✅
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            Current stage:{" "}
                            <span className="font-semibold text-green-700">{state}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
