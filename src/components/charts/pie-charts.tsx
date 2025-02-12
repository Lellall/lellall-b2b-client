import React, { useState } from 'react';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { scaleOrdinal } from '@visx/scale';
import { Group } from '@visx/group';
import { GradientPinkBlue } from '@visx/gradient';
import { animated, useTransition, to } from '@react-spring/web';

export type PieChartProps<Datum> = {
  width: number;
  height: number;
  data: Datum[];
  valueAccessor: (d: Datum) => number;
  colorAccessor: (d: Datum) => string;
  margin?: { top: number; right: number; bottom: number; left: number };
  animate?: boolean;
  onClickDatum?: (d: Datum) => void;
};

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export function PieChart<Datum>({
  width,
  height,
  data,
  valueAccessor,
  colorAccessor,
  margin = defaultMargin,
  animate = true,
  onClickDatum,
}: PieChartProps<Datum>) {
  if (width < 10) return null;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  return (
    <svg width={width} height={height}>
      <GradientPinkBlue id="visx-pie-gradient" />
      <rect rx={14} width={width} height={height} fill="url('#visx-pie-gradient')" />
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie data={data} pieValue={valueAccessor} outerRadius={radius}>
          {(pie) => (
            <AnimatedPie<Datum>
              {...pie}
              animate={animate}
              getKey={(arc) => String(valueAccessor(arc.data))}
              onClickDatum={onClickDatum}
              getColor={(arc) => colorAccessor(arc.data)}
            />
          )}
        </Pie>
      </Group>
    </svg>
  );
}

// Animated Pie Component
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum?: (d: Datum) => void;
}) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: (arc) => ({ startAngle: arc.startAngle, endAngle: arc.startAngle, opacity: 0 }),
    enter: (arc) => ({ startAngle: arc.startAngle, endAngle: arc.endAngle, opacity: 1 }),
    update: (arc) => ({ startAngle: arc.startAngle, endAngle: arc.endAngle, opacity: 1 }),
    leave: (arc) => ({ startAngle: arc.endAngle, endAngle: arc.endAngle, opacity: 0 }),
    keys: getKey,
  });

  return transitions((props, arc, { key }) => (
    <g key={key}>
      <animated.path
        d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
          path({ ...arc, startAngle, endAngle }) || ''
        )}
        fill={getColor(arc)}
        onClick={() => onClickDatum?.(arc.data)}
      />
    </g>
  ));
}