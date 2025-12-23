import React from "react";

type Health = {
    health: {
        componentResults: any;
        isSystemHealthy: boolean;
    };
};

export default function RibbonHeader() {
    const [health, setHealth] = React.useState<Health | null>(null);

    React.useEffect(() => {
        let interval: NodeJS.Timeout;

        async function fetchData() {
            try {
                const response = await fetch("/api/ping");
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                const data = await response.json();
                setHealth(data);
            } catch (error) {
                setHealth({
                    health: {
                        componentResults: error,
                        isSystemHealthy: false
                    }
                });
            }
        }

        fetchData();
        interval = setInterval(fetchData, 5_000);

        return () => clearInterval(interval);
    }, []);

    function SirenIcon() {
        return (
            <div className="siren-container">
                {/* Base */}
                <div className="siren-base"></div>

                {/* Dome */}
                <div className="siren-dome">
                    <div className="siren-light"></div>
                </div>

                <style jsx>{`
                    .siren-container {
                        display: inline-flex;
                        position: relative;
                        width: 1em;
                        height: 1em;
                        vertical-align: middle; /* aligns with text */
                    }

                    .siren-base {
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 40%;
                        height: 20%;
                        background: #333;
                        border-radius: 0.1em;
                    }

                    .siren-dome {
                        position: absolute;
                        bottom: 20%;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 100%;
                        height: 80%;
                        background: linear-gradient(145deg, #fa0202, #aa6363);
                        border-radius: 50% 50% 25% 25%;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .siren-light {
                        width: 60%;
                        height: 100%;
                        background: radial-gradient(circle, rgb(166, 46, 46) 10%, rgba(255, 0, 0, 1) 80%);
                        border-radius: 50%;
                        animation: pulseLight 1s infinite, swing 1s ease-in-out infinite alternate;
                        box-shadow: 0 0 10px rgba(255, 0, 0, 0.99), 0 0 20px #c52413, 0 0 30px #f30101;
                    }

                    @keyframes pulseLight {
                        0%, 100% {
                            opacity: 1;
                            filter: brightness(2);
                        }
                        50% {
                            opacity: 0.2;
                            filter: brightness(0.5);
                        }
                    }

                    @keyframes swing {
                        0% {
                            transform: rotate(-15deg);
                        }
                        100% {
                            transform: rotate(15deg);
                        }
                    }

                    @keyframes rotateLight {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </div>
        );
    }


    return (
        <div className="w-full flex justify-center items-center bg-gray-800 text-white px-6 py-3 shadow-md rounded-2xl">
            <h1 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
                Dataspace Dashbaord : &nbsp;&nbsp;&nbsp;
                <span className="flex items-center gap-2">
            {health?.health?.isSystemHealthy ? (
                // Green dot for healthy
                <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
            ) : (
                <SirenIcon />
            )}
                        <span>{health?.health?.isSystemHealthy ? "Healthy" : "Unhealthy"}</span>
          </span>

            </h1>
        </div>
    );
}
