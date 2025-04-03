import React from 'react';
import Achievement from './Achievement.jsx';
import { achievements, resetAchievements, unlockAchievement, getDoingNothingSince, validateAchievements } from '../js/achievements.ts';

export default function Achievements() {
  let [currentAchievements, setAchievements] = React.useState(localStorage.getItem('achievements') || '');
  let [mouseDistance, setMouseDistance] = React.useState(localStorage.getItem('ach_mousedistance') || '0');
  let [mouseClicks, setMouseClicks] = React.useState(localStorage.getItem('ach_mouseclicks') || '0');
  let [pageLoads, setPageLoads] = React.useState(localStorage.getItem('ach_pageloads') || '0');
  let [faves, setFaves] = React.useState(localStorage.getItem('ach_faves') || '0');
  let [tagEdits, setTagEdits] = React.useState(localStorage.getItem('ach_tagedits') || '0');
  let [scrollDistance, setScrollDistance] = React.useState(localStorage.getItem('ach_scroll') || '0');
  let [posts, setPosts] = React.useState(localStorage.getItem('ach_posts') || '0');
  let [comments, setComments] = React.useState(localStorage.getItem('ach_comments') || '0');
  let [upvotes, setUpvotes] = React.useState(localStorage.getItem('ach_upvotes') || '0');
  let [doingNothingFor, setDoingNothingFor] = React.useState('Unknown amount of time');
  let [submitStatus, setSubmitStatus] = React.useState('');
  let updaterRef = React.useRef(null);

  const achievementList = () => {
    return Array.from(currentAchievements.split(',').map((id) => {
      return achievements[Number(id)];
    })).sort((a, b) => {
      return b.points - a.points;
    });
  }

  const lockedAchievementList = () => {
    const unlockedIds = currentAchievements.split(',').map((n) => Number(n));

    return achievements.filter((ach, idx) => {
      return ach.points % 5 === 0 && !unlockedIds.includes(idx);
    });
  }

  const achievementCount = () => {
    return currentAchievements.split(',').length;
  }

  const achievementPoints = () => {
    return currentAchievements.split(',').reduce((acc, id) => {
      const a = achievements[Number(id)];

      if (a && Number.isInteger(a.points))
        return acc + a.points;
      else
        return acc;
    }, 0);
  }

  const uiResetAchs = () => {
    if (confirm('Are you sure you want to reset all of your achievements? This cannot be undone.')) {
      resetAchievements();
      unlockAchievement(20);
      setAchievements(localStorage.getItem('achievements'));
      window.location.reload();
    }
  }

  const unlockedAchievements = () => {
    return achievementList().map((ach) => {
      if (ach)
        return <Achievement key={`unlk-${ach.name}`} name={ach.name} description={ach.desc} points={ach.points} />
      else
        return <Achievement name="Invalid Achievement" description="You're not supposed to see this" points="-9999" />
    })
  }

  const lockedAchievements = () => {
    return lockedAchievementList().map((ach) => {
      if (ach)
        return <Achievement key={`lk-${ach.name}`} name={ach.name} description={ach.desc} points="?" icon="fa-lock" />
      else
        return <Achievement name="Invalid Achievement" description="You're not supposed to see this" points="-9999" />
    })
  }

  const validateAndSubmit = () => {
    if (localStorage.getItem('submitOnLoad') !== '1') {
      localStorage.setItem('submitOnLoad', '1');
      window.location.reload();
      return;
    } else {
      localStorage.setItem('submitOnLoad', '0');
      validateAchievements();

      const data = new URLSearchParams();

      data.append('_csrf_token', window.booru.csrfToken);
      data.append('achievements', localStorage.getItem('achievements') || '');
      data.append('version', '3');

      setSubmitStatus("Submitting...");

      const errorTimeout = setTimeout(() => {
        setSubmitStatus("Submitting... this is taking longer than expected, refresh the page and try again.");
      }, 10000);

      fetch('/achievements', {
        method: "POST",
        body: data
      }).then((resp) => {
        clearTimeout(errorTimeout);

        if (resp.status == 201) {
          setSubmitStatus("Score updated successfully!");
        } else if (resp.status == 200) {
          setSubmitStatus("Score already submitted, not updating.");
        } else if (resp.status == 406) {
          setSubmitStatus("You're a sneaky cheater, aren't you?");
        } else {
          setSubmitStatus("An error occurred, please refresh the page and try again.");
        }
      })
    }
  }

  if (localStorage.getItem('submitOnLoad') === '1') {
    validateAndSubmit();
  }

  const renderSubmitForm = () => {
    if (window.booru.userIsSignedIn) {
      return <a className="button button--state-success" onClick={validateAndSubmit}>Submit Score</a>
    } else {
      return <></>
    }
  }

  const renderSubmitStatus = () => {
    if (submitStatus != '') {
      return <strong>{submitStatus}</strong>
    }

    return <></>
  }

  const trophyFromPoints = (pts) => {
    if (pts >= 5000) {
      return 'True Gamer';
    } else if (pts >= 2500) {
      return 'Diamond';
    } else if (pts >= 1500) {
      return 'Platinum';
    } else if (pts >= 900) {
      return 'Gold';
    } else if (pts >= 400) {
      return 'Silver';
    } else {
      return 'Bronze';
    }
  }

  if (updaterRef.current) {
    clearInterval(updaterRef.current);
  }

  updaterRef.current = setInterval(() => {
    const diff = (Date.now() - getDoingNothingSince()) / 1000;

    setAchievements(localStorage.getItem('achievements') || '');
    setMouseDistance(localStorage.getItem('ach_mousedistance') || '0');
    setMouseClicks(localStorage.getItem('ach_mouseclicks') || '0');
    setPageLoads(localStorage.getItem('ach_pageloads') || '0');
    setFaves(localStorage.getItem('ach_faves') || '0');
    setTagEdits(localStorage.getItem('ach_tagedits') || '0');
    setScrollDistance(localStorage.getItem('ach_scroll') || '0');
    setPosts(localStorage.getItem('ach_posts') || '0');
    setComments(localStorage.getItem('ach_comments') || '0');
    setUpvotes(localStorage.getItem('ach_upvotes') || '0');
    setDoingNothingFor(`${Math.floor(diff / 3600)} hours ${((diff - diff % 60) / 60) % 60} minutes ${Math.floor(diff % 60)} seconds`)
  }, 333);

  unlockAchievement(1);

  return <>
    <h2>Stats</h2>
    <p>You unlocked <strong>{achievementCount()}</strong> out of <strong>{achievements.length - 4}</strong> achievements.</p>
    <p><strong>Warning:</strong> pressing the "Submit Score" button may reset some of your progress, it inconsistent data is detected.</p>
    <div className="achievements__score">Score: <strong className="achievements__score">{achievementPoints()} </strong>{renderSubmitForm()} <a className="button button--state-danger" href="#" onClick={uiResetAchs}>Reset</a> {renderSubmitStatus()}</div>
    <p>
      If you submit your points (provided you do not cheat), you would get a <strong>{trophyFromPoints(achievementPoints())} Trophy</strong> at the end of the event. <strong>You must submit your score to get a badge!</strong>
    </p>
    <table className="table achievements__stats-table">
      <tbody>
        <tr>
          <td>Mouse Distance Travelled</td>
          <td>{mouseDistance}</td>
        </tr>
        <tr>
          <td>Mouse Distance Scrolled</td>
          <td>{scrollDistance}</td>
        </tr>
        <tr>
          <td>Mouse Clicks</td>
          <td>{mouseClicks}</td>
        </tr>
        <tr>
          <td>Page Loads</td>
          <td>{pageLoads}</td>
        </tr>
        <tr>
          <td>Tag Edits</td>
          <td>{tagEdits}</td>
        </tr>
        <tr>
          <td>Faves</td>
          <td>{faves}</td>
        </tr>
        <tr>
          <td>Upvotes</td>
          <td>{upvotes}</td>
        </tr>
        <tr>
          <td>Forum Posts</td>
          <td>{posts}</td>
        </tr>
        <tr>
          <td>Comments</td>
          <td>{comments}</td>
        </tr>
        <tr>
          <td>You've been doing nothing for</td>
          <td>{doingNothingFor}</td>
        </tr>
      </tbody>
    </table>
    <h2>Unlocked Achievements</h2>
    <div className="achievements">
      {unlockedAchievements()}
    </div>
    <h2>Locked Achievements</h2>
    <div className="achievements achievements--locked">
      {lockedAchievements()}
    </div>
    <p>By the way, try not to cheat, okay? You're kind of achieving nothing by doing so except ruining the fun of the game for yourself.</p>
    <p>The admins shall bestow dire consequences and unforgivable curses upon you if you cheat :p</p>
  </>
}
