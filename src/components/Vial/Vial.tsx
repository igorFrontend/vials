import React, { useMemo, memo, useCallback, useEffect, useRef } from 'react'
import cn from 'classnames'
import './Vial.scss'

export type AnimateVial = {
  id: number
  colorsCount: number
  toId: number
  animationTime: number
  targetLeft: number
  targetTop: number
}

type Props = {
  width?: string
  active: boolean
  colors: string[]
  id: number
  totalColors: number
  animatePosition?: AnimateVial
  onClick: (id: number) => void
}

export const Vial = memo(({ width, id, active, colors, totalColors, animatePosition, onClick }: Props) => {
  const styles = useMemo(() => ({ width }), [width])
  const colorsHeight = useMemo(() => 100 / totalColors, [totalColors])
  const blocked = useMemo(() => colors.length === totalColors && colors.every(item => item === colors[0]), [totalColors, colors])
  const vialRef = useRef<HTMLDivElement>()

  useEffect(() => {
    if (animatePosition && vialRef.current) {
      vialRef.current.style.setProperty('--animatePositionX', animatePosition.targetLeft + 'px')
      vialRef.current.style.setProperty('--animatePositionY', animatePosition.targetTop + 'px')
      vialRef.current.style.setProperty('--animateRotate', '70deg')
      vialRef.current.style.setProperty('--animateZIndex', '2')
    } else {
      vialRef.current.style.setProperty('--animatePositionX', '0')
      vialRef.current.style.setProperty('--animatePositionY', '0')
      vialRef.current.style.setProperty('--animateRotate', '0')
      setTimeout(() => vialRef.current.style.setProperty('--animateZIndex', '1'), 300) // дожидаемся пока пробирка вернётся на место
    }
  }, [animatePosition])

  const handleClick = useCallback(() => {
    onClick(id)
  }, [id, onClick])

  const colorsLength = useMemo(() => colors.length, [colors])

  return <div className="vial" style={styles} ref={vialRef}>
    <button
      className={cn("vial__inner", {
        "vial__inner_active": active && !blocked && !animatePosition,
        "vial__inner_blocked": blocked,
        "vial__inner_animated": animatePosition,
      })}
      onClick={handleClick}
    >
      {colors.map((color, index) => (
        <div
          className={cn("vial__color", { "vial__color_animated": animatePosition && index > colorsLength - animatePosition.colorsCount - 1 })}
          style={{ backgroundColor: color, height: `${colorsHeight}%` }}
          key={index}
        />
      ))}
    </button>
  </div>
})
