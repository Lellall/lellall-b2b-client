import React, { useState } from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import { Tooltip, useTooltip } from "@visx/tooltip";

const data = [
    { label: "Confirmed", value: 110, color: "#94A89A" },
    { label: "Awaited", value: 50, color: "#CBD5C0" },
    { label: "Cancelled", value: 20, color: "#65856C" },
    { label: "Failed", value: 12, color: "#37513C" },
];

const width = 300;
const height = 300;
const radius = width / 2;
const innerRadius = radius - 50;

const DonutChart = () => {
    const [tooltipData, setTooltipData] = useState(null);
    const { showTooltip, hideTooltip, tooltipLeft, tooltipTop, tooltipOpen } =
        useTooltip();

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const colorScale = scaleOrdinal({
        domain: data.map((d) => d.label),
        range: data.map((d) => d.color),
    });

    return (
        <div className="relative w-[350px] h-[350px] flex px-4 items-center">
            <div>

                <svg width={width} height={height}>
                    <Group top={height / 2} left={width / 2}>
                        <Pie
                            data={data}
                            pieValue={(d) => d.value}
                            outerRadius={radius}
                            innerRadius={innerRadius}
                            cornerRadius={5}
                        >
                            {(pie) =>
                                pie.arcs.map((arc) => (
                                    <g
                                        key={arc.data.label}
                                        onMouseEnter={(event) => {
                                            showTooltip({
                                                tooltipData: arc.data,
                                                tooltipLeft: event.clientX,
                                                tooltipTop: event.clientY,
                                            });
                                        }}
                                        onMouseLeave={hideTooltip}
                                    >
                                        <path d={pie.path(arc)} fill={colorScale(arc.data.label)} />
                                    </g>
                                ))
                            }
                        </Pie>
                        {/* Center Text */}
                        <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            fontSize={18}
                            fontWeight="bold"
                            fill="#37513C"
                        >
                            Total
                        </text>
                        <text
                            x="0"
                            y="20"
                            textAnchor="middle"
                            fontSize={22}
                            fontWeight="bold"
                            fill="#37513C"
                        >
                            {total}
                        </text>
                    </Group>
                </svg>

                {/* Tooltip */}
                {tooltipOpen && (
                    <Tooltip left={tooltipLeft} top={tooltipTop}>
                        {tooltipData?.label}: {tooltipData?.value}
                    </Tooltip>
                )}
            </div>
            <div>
                <div className="ml-2 mt-4 flex flex-col items-start">
                    {data.map((d) => (
                        <div key={d.label} className="flex items-center mb-1">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: d.color }}
                            />
                            <span className="text-sm text-gray-700">{d.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}

        </div>
    );
};

export default DonutChart;
