import React from 'react';

export default function Achievement({ name, description, icon, points, vanish }) {
  const renderPoints = () => {
    if (points != 0)
      return <div className="achievement__score"><span>{points} points</span></div>
    else
      return <div className="achievement__score">Unlocked!</div>
  }

  let [extraClasses, setExtraClasses] = React.useState('');

  if (vanish && vanish > 0) {
    setTimeout(() => {
      setExtraClasses('achievement--vanish');
    }, vanish)
  }

  return <div className={`achievement ${extraClasses}`} data-points={points || '0'}>
    <i className={`fa ${icon || "fa-trophy"}`}></i>
    <div className="achievement__body">
      <span className="achievement__title">{name}</span>
      <span>{description}</span>
    </div>
    {renderPoints()}
  </div>
}
