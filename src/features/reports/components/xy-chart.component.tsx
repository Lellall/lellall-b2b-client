import React, { useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { LinePath, AreaClosed } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";
import NavigationTabs, { Tab } from "@/components/ui/navigation-tab";

const data = [
  { date: new Date("2024-01-01"), confirmed: 1500, awaited: 1000, cancelled: 800, failed: 500 },
  { date: new Date("2024-01-15"), confirmed: 1800, awaited: 1100, cancelled: 850, failed: 520 },
  { date: new Date("2024-02-01"), confirmed: 2500, awaited: 1500, cancelled: 1000, failed: 600 },
  { date: new Date("2024-02-15"), confirmed: 2700, awaited: 1600, cancelled: 1050, failed: 620 },
  { date: new Date("2024-03-01"), confirmed: 1800, awaited: 1200, cancelled: 900, failed: 550 },
  { date: new Date("2024-03-15"), confirmed: 2000, awaited: 1300, cancelled: 950, failed: 580 },
  { date: new Date("2024-04-01"), confirmed: 3200, awaited: 1700, cancelled: 1100, failed: 700 },
  { date: new Date("2024-04-15"), confirmed: 3400, awaited: 1800, cancelled: 1150, failed: 720 },
  { date: new Date("2024-05-01"), confirmed: 4000, awaited: 2000, cancelled: 1300, failed: 750 },
  { date: new Date("2024-05-15"), confirmed: 4200, awaited: 2100, cancelled: 1350, failed: 780 },
  { date: new Date("2024-06-01"), confirmed: 3700, awaited: 1900, cancelled: 1250, failed: 720 },
  { date: new Date("2024-06-15"), confirmed: 3900, awaited: 1950, cancelled: 1280, failed: 740 },
  { date: new Date("2024-07-01"), confirmed: 4200, awaited: 2100, cancelled: 1400, failed: 800 },
  { date: new Date("2024-07-15"), confirmed: 4400, awaited: 2200, cancelled: 1450, failed: 820 },
  { date: new Date("2024-08-01"), confirmed: 4100, awaited: 2000, cancelled: 1350, failed: 780 },
  { date: new Date("2024-08-15"), confirmed: 4300, awaited: 2100, cancelled: 1400, failed: 800 },
  { date: new Date("2024-09-01"), confirmed: 3800, awaited: 1950, cancelled: 1300, failed: 770 },
  { date: new Date("2024-09-15"), confirmed: 4000, awaited: 2000, cancelled: 1350, failed: 790 },
  { date: new Date("2024-10-01"), confirmed: 3600, awaited: 1800, cancelled: 1200, failed: 740 },
  { date: new Date("2024-10-15"), confirmed: 3800, awaited: 1900, cancelled: 1250, failed: 760 },
  { date: new Date("2024-11-01"), confirmed: 3900, awaited: 1850, cancelled: 1250, failed: 760 },
  { date: new Date("2024-11-15"), confirmed: 4100, awaited: 1950, cancelled: 1300, failed: 780 },
  { date: new Date("2024-12-01"), confirmed: 4800, awaited: 2200, cancelled: 1500, failed: 850 },
];


const statusKeys = {
  Confirmed: "confirmed",
  Awaited: "awaited",
  Cancelled: "cancelled",
  Failed: "failed",
};

const tabs: Tab[] = [
  { name: "Confirmed", active: true },
  { name: "Awaited", active: false },
  { name: "Cancelled", active: false },
  { name: "Failed", active: false },
];

const LineChart = () => {
  const [activeStatus, setActiveStatus] = useState("Confirmed");

  return (
    <div className="w-full p-4 bg-white rounded-lg">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-4">
        <NavigationTabs
          tabs={tabs}
          width="470px"
          onTabClick={(tab) => setActiveStatus(tab.name)}
        />
      </div>

      {/* Responsive Chart */}
      <div className="w-full h-[350px]">
        <ParentSize>{({ width, height }) => {
          if (width < 10) return null; // Prevent rendering issues when width is too small

          const margin = { top: 20, right: 20, bottom: 40, left: 50 };
          const xMax = width - margin.left - margin.right;
          const yMax = height - margin.top - margin.bottom;

          const xScale = scaleTime({
            domain: [data[0].date, data[data.length - 1].date],
            range: [0, xMax],
          });

          const yScale = scaleLinear({
            domain: [0, 5000],
            range: [yMax, 0], // Flip to align correctly
          });

          const getX = (d) => d.date;
          const getY = (d) => d[statusKeys[activeStatus]];

          return (
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                {/* X & Y Axes */}
                <AxisBottom
                  top={yMax}
                  scale={xScale}
                  tickFormat={(v) => v.toLocaleString("en-US", { month: "short" })}
                />
                <AxisLeft scale={yScale} />

                {/* Area Fill */}
                <AreaClosed
                  data={data}
                  x={(d) => xScale(getX(d))}
                  y={(d) => yScale(getY(d))}
                  yScale={yScale}
                  fill="rgba(34, 139, 34, 0.2)"
                  stroke="#37513C"
                  strokeWidth={1}
                  curve={curveMonotoneX}
                />
                <LinePath
                  data={data}
                  x={(d) => xScale(getX(d))}
                  y={(d) => yScale(getY(d))}
                  stroke="#228B22"
                  strokeWidth={1}
                  curve={curveMonotoneX}
                />
              </Group>
            </svg>
          );
        }}</ParentSize>
      </div>
    </div>
  );
};

export default LineChart;
