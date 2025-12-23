import React from "react";

interface RibbonHandlerProps {
    title: React.ReactNode;
    actions?:  React.ReactNode;
}

export default function RibbonHeader(props: RibbonHandlerProps) {
    return (
        <div className="flex justify-between items-center mb-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold tracking-wide">{props.title}</h1>
            {props.actions && <div className="flex items-center gap-3">{props.actions}</div>}
        </div>
    );
}