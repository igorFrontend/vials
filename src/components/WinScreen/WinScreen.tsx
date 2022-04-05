import React, { memo } from 'react'
import cn from 'classnames'
import './WinScreen.scss'

type Props = {
  level: number
  show: boolean
  onNextLevel: () => void
}

export const WinScreen = memo(({ level, show, onNextLevel }: Props) => {
  return <div className={cn("win-screen", { "win-screen_show": show })}>
    <div className="win-screen__inner">
    <h1 className='win-screen__title'>Победа</h1>
    <h2 className='win-screen__title'>Уровень №{level} проден</h2>
    <button type="button" className="win-screen__button" onClick={onNextLevel}>Следующий уровень</button>
    </div>
  </div>
})
