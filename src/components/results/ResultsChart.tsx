import { motion } from 'framer-motion'
import { useId, useMemo, useRef, useState } from 'react'
import { resultsViewConfig } from '../../config/resultsView'
import { useI18n } from '../../hooks/useI18n'
import type { ChartData } from '../../utils/results'

interface ResultsChartProps {
  chart: ChartData
  themeClasses: {
    accent: string
    primary: string
    secondary: string
    border: string
    card: string
  }
}

const { animation, chart: chartConfig, format, tooltip } = resultsViewConfig

function ResultsChart({ chart, themeClasses }: ResultsChartProps) {
  const i18n = useI18n()
  const viewBox = `0 0 ${chart.width} ${chart.height}`
  const gradientId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const tooltipValue = useMemo(() => {
    if (hoverIndex === null) return null
    return chart.values[hoverIndex]
  }, [chart.values, hoverIndex])

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container || chart.points.length === 0) return

    const rect = container.getBoundingClientRect()
    const localX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width)
    const viewX = (localX / rect.width) * chart.width

    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY
    chart.points.forEach((point, index) => {
      const distance = Math.abs(point.x - viewX)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    if (nearestIndex !== hoverIndex) {
      setHoverIndex(nearestIndex)
    }

    const point = chart.points[nearestIndex]
    setTooltipPosition({
      x: (point.x / chart.width) * rect.width,
      y: (point.y / chart.height) * rect.height,
    })
  }

  const handlePointerLeave = () => {
    setHoverIndex(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: animation.containerYOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.chartDelay }}
      className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} px-6 py-5 shadow-xl`}
    >
      <div className={`text-xs uppercase tracking-widest ${themeClasses.secondary}`}>
        <span className={themeClasses.accent}>{i18n.results.chartWpm}</span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        className={`relative mt-4 ${themeClasses.accent}`}
      >
        <svg viewBox={viewBox} className="w-full h-40">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity={chartConfig.gradientStops.start} />
              <stop offset="50%" stopColor="currentColor" stopOpacity={chartConfig.gradientStops.mid} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={chartConfig.gradientStops.end} />
            </linearGradient>
          </defs>

          {chart.gridY.map((y) => (
            <line
              key={y}
              x1={chartConfig.paddingX}
              x2={chart.width - chartConfig.paddingX}
              y1={y}
              y2={y}
              className="stroke-current"
              strokeOpacity={chartConfig.gridOpacity}
              strokeWidth={chartConfig.gridStrokeWidth}
            />
          ))}

          <motion.path
            d={chart.areaPath}
            className="fill-current"
            initial={{ opacity: 0 }}
            animate={{ opacity: chartConfig.fillOpacity }}
            transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.chartDelay }}
          />

          <motion.path
            d={chart.linePath}
            className="fill-none stroke-current"
            strokeWidth={chartConfig.lineWidth * chartConfig.glowWidthMultiplier}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={chartConfig.glowOpacity}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: chartConfig.glowOpacity }}
            transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.chartDelay }}
          />

          <motion.path
            d={chart.linePath}
            className="fill-none"
            stroke={`url(#${gradientId})`}
            strokeWidth={chartConfig.lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: animation.containerDuration, ease: animation.ease, delay: animation.chartDelay }}
          />

          {chart.points.map((point, index) => (
            <motion.circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r={chartConfig.dotRadius}
              className="fill-current"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: animation.containerDuration,
                ease: animation.ease,
                delay: animation.chartDelay + index * chartConfig.dotDelayStep,
              }}
            />
          ))}
        </svg>
        {tooltipValue !== null && hoverIndex !== null && (
          <div
            className={`absolute ${themeClasses.card} ${themeClasses.border} ${tooltip.opacityClass} border text-xs font-semibold ${themeClasses.primary} ${tooltip.radius} ${tooltip.maxWidthClass} pointer-events-none`}
            style={{
              left: tooltipPosition.x + tooltip.offsetX,
              top: tooltipPosition.y + tooltip.offsetY,
              padding: `${tooltip.paddingY}px ${tooltip.paddingX}px`,
            }}
          >
            {Number(tooltipValue).toFixed(format.wpmDecimals)} {i18n.results.wpm}
          </div>
        )}
      </div>
      <div className={`mt-3 text-xs uppercase tracking-widest text-center ${themeClasses.secondary}`}>
        {i18n.results.chartTime}
      </div>
    </motion.div>
  )
}

export default ResultsChart
