import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimateVial, Vial } from '../Vial/Vial'
import { WinScreen } from '../WinScreen/WinScreen'
import './App.scss'

type VialsObj = {
  id: number
  colors: string[]
}

const colors = ['#A000A0', '#004C3F', '#FFEB3E', '#B4DBF9', '#2D1C4B', '#FF5B5B', '#88C43A', '#9B7FE6', '#00FFFF', '#4F7942', '#FC0FC0', '#816AB0']

const generateVials = (countVials: number, countColorsInVials: number): VialsObj[] => {
  const vials = []
  const workColors = colors.slice(0, countVials - 2)
  const colorsList = []
  for (let c = 0; c < countColorsInVials; c++) {
    colorsList.push(...workColors)
  }
  colorsList.sort(() => Math.round(Math.random()) || -1)

  for (let v = 0; v < countVials; v++) {
    if (v === countVials - 1 || v === countVials - 2) {
      vials.push({ id: v + 1, colors: [] })
    } else {
      let colors = []
      for (let c = 0; c < countColorsInVials; c++) {
        colors.push(colorsList.pop())
      }
      vials.push({ id: v + 1, colors })
    }
  }
  return vials
}

const acessColorsCount = [3, 4]
const acessVialsCount = [12, 10]
const storageKey = 'levelInfo'

const firstLevel = {
  loading: false,
  level: 1,
  colorsCount: 2,
  vialsCount: 12,
  vials: generateVials(12, 2),
}

export const App = () => {
  const [levelInfo, setLevelInfo] = useState({
    ...firstLevel,
    loading: true,
  })
  const [vialsList, setVialsList] = useState<VialsObj[]>(levelInfo.vials)
  const [activeVial, setActiveVial] = useState<number>(0)
  const [animateVials, setAnimateVials] = useState<AnimateVial>()
  const wrapperRef = useRef<HTMLDivElement>()
  const win = useMemo(() => vialsList.every(vial =>
    !vial.colors.length ||
    (vial.colors.length === levelInfo.colorsCount && vial.colors.every(color => color === vial.colors[0]))), [vialsList])

  useEffect(() => {
    const memoryData = localStorage.getItem(storageKey)
    if (memoryData) {
      try {
        const data = JSON.parse(memoryData)
        setLevelInfo(data)
        setVialsList(data.vials || [])
      } catch (e) {
        setLevelInfo(firstLevel)
        setVialsList(firstLevel.vials || [])
        localStorage.setItem(storageKey, JSON.stringify(firstLevel))
      }
    } else {
      setLevelInfo(firstLevel)
      setVialsList(firstLevel.vials || [])
      localStorage.setItem(storageKey, JSON.stringify(firstLevel))
    }
  }, [])

  const handleЕransfuse = useCallback((id: number) => {
    if (!activeVial) {
      setActiveVial(id)
      return
    }
    if (activeVial === id) {
      setActiveVial(0)
      return
    }
    const oldVialIndex = vialsList.findIndex(item => item.id === activeVial)
    const newVialIndex = vialsList.findIndex(item => item.id === id)
    const oldVial = vialsList[oldVialIndex]
    const newVial = vialsList[newVialIndex]

    let singleColorsCount = 0 // количество одинаковых цветов сверху пробирки
    const lastColor = oldVial.colors[oldVial.colors.length - 1]
    for (let index = oldVial.colors.length - 1; index >= 0; index--) {
      if (oldVial.colors[index] !== lastColor) {
        break
      }
      singleColorsCount++
    }

    const emptySlots = levelInfo.colorsCount - newVial.colors.length
    const lastTargetColor = newVial.colors[newVial.colors.length - 1]

    const transportedColorsCount = Math.min(emptySlots, singleColorsCount)
    const transportingColors = oldVial.colors.slice(oldVial.colors.length - transportedColorsCount)
    const remainingColors = oldVial.colors.slice(0, oldVial.colors.length - transportedColorsCount)

    if ((lastTargetColor && lastTargetColor !== lastColor) || emptySlots <= 0) {
      setActiveVial(id)
      return
    }

    const oldVialElem: Element = wrapperRef.current.children[oldVialIndex]
    const newVialElem: Element = wrapperRef.current.children[newVialIndex]
    const oldRect = oldVialElem.getBoundingClientRect()
    const newRect = newVialElem.getBoundingClientRect()
    const animationTime = 500
    setAnimateVials({
      id: activeVial,
      colorsCount: transportedColorsCount,
      toId: id,
      animationTime,
      targetLeft: newRect.left - oldRect.left - (newRect.width - 15) / 2,
      targetTop: newRect.top - oldRect.top - 15,
    })
    setActiveVial(0)

    setTimeout(() => {
      setAnimateVials(undefined)
      setVialsList(oldList => oldList.map(item => {
        if (item.id === activeVial) {
          return { ...item, colors: remainingColors }
        }
        if (item.id === id) {
          return { ...item, colors: [...item.colors, ...transportingColors] }
        }
        return item
      }))
    }, animationTime)

  }, [activeVial, vialsList])

  const handleNextLevel = useCallback(() => {
    const colorsCount = acessColorsCount[Math.floor(Math.random() * acessColorsCount.length)];
    const vialsCount = acessVialsCount[Math.floor(Math.random() * acessVialsCount.length)];

    const newInfo = {
      vialsCount,
      colorsCount,
      loading: false,
      level: levelInfo.level + 1,
      vials: generateVials(vialsCount, colorsCount),
    }

    localStorage.setItem(storageKey, JSON.stringify(newInfo))
    setLevelInfo(newInfo)
    setVialsList(newInfo.vials)
  }, [levelInfo])

  const handleRefresh = useCallback(() => {
    const memoryData = localStorage.getItem(storageKey)
    if (memoryData) {
      try {
        const data = JSON.parse(memoryData)
        setLevelInfo(data)
        setVialsList(data.vials || [])
      } catch (e) {
        setLevelInfo(firstLevel)
        setVialsList(firstLevel.vials || [])
        localStorage.setItem(storageKey, JSON.stringify(firstLevel))
      }
    } else {
      setLevelInfo(firstLevel)
      setVialsList(firstLevel.vials || [])
      localStorage.setItem(storageKey, JSON.stringify(firstLevel))
    }
  }, [])

  return <div className="app">
    {!levelInfo.loading && (
      <>
        <div>
          <button type="button" className="app__refresh" onClick={handleRefresh} title="Наать заново">🗘</button>
          Уровень № {levelInfo.level}
        </div>
        <div className="app__wrapper" ref={wrapperRef}>
          {vialsList.map(item => (
            <Vial
              active={activeVial === item.id}
              id={item.id}
              animatePosition={(animateVials && animateVials.id === item.id && animateVials) || undefined}
              totalColors={levelInfo.colorsCount}
              onClick={handleЕransfuse}
              colors={item.colors}
              key={item.id}
              width={`${200 / vialsList.length}%`}
            />
          ))}
        </div>
      </>
    )}
    <WinScreen onNextLevel={handleNextLevel} show={win} level={levelInfo.level} />
  </div>
}
