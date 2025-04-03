import React from 'react';
import Achievement from './Achievement.jsx';
import { achievements } from '../js/achievements.ts';

export default function Overlay() {
  let [displayData, setDisplayData] = React.useState([]);
  let internDisplayData = React.useRef(new Map());
  let updaterRef = React.useRef(null);
  let clearRef = React.useRef(null);

  const updateDisplayData = (achList) => {
    const now = Date.now();

    if (achList != '') {
      achList.split(',').forEach((id) => {
        if (!internDisplayData.current.get(id)) {
          let dData = achievements[Number(id)];
          dData.startTime = now;

          internDisplayData.current.set(id, dData);
        }
      });
    }

    internDisplayData.current.forEach((v, k) => {
      if (now - v.startTime > 5000) {
        internDisplayData.current.delete(k);
      }
    });

    setDisplayData(internDisplayData.current.values());
  }

  if (updaterRef.current) {
    clearInterval(updaterRef.current);
  }

  updaterRef.current = setInterval(() => {
    const newData = localStorage.getItem('new_achievements') || '';

    if (newData != '') {
      updateDisplayData(newData);
      localStorage.setItem('new_achievements', '');
    }
  }, 333);

  if (clearRef.current) {
    clearInterval(clearRef.current);
  }

  clearRef.current = setInterval(() => {
    const now = Date.now();
    let shouldUpdate = true;

    internDisplayData.current.forEach((v) => {
      if (now - v.startTime <= 4000) {
        shouldUpdate = false;
      }
    });

    if (shouldUpdate) {
      updateDisplayData('');
    }
  }, 1000);

  return <div className="achievement__new">
    {Array.from(displayData.map((a) => {
      if (Date.now() - a.startTime < 5000) {
        if (a)
          return <Achievement key={a.name} name={a.name} description={a.desc} points={a.points} vanish={2000} />
        else
          return <Achievement name="Invalid Achievement" description="You're not supposed to see this" points="-9999" />
      }
    }))}
  </div>
}
