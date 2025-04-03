import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Achievements from '../components/Achievements.jsx';
import Overlay from '../components/Overlay.jsx';
import { $, $$ } from './utils/dom';
import { TextInputElement } from 'autocomplete/input.js';

// yes using "any" as type here is horrible API design but
// honestly I do not have time or motivation to do it "properly"
// just, *checks watch*, 12 hours before the event
// so go cry to ur mama about it
// eslint-disable-next-line
type AchievementCallback = (event: any) => boolean;
type AchievementTrigger = () => boolean;

interface Achievement {
  name: string;
  desc: string;
  points: number;
  event?: string;
  callback?: AchievementCallback;
  trigger?: AchievementTrigger;
  persistent?: boolean;
}

let doingNothingSince = Date.now();
let lastScrollY = window.scrollY;
let scrollIter = 0;
const upvotedIds: string[] = [];
const favedIds: string[] = [];

const achievements: Array<Achievement> = [
  {
    name: 'Page Loader',
    desc: 'Load any page',
    points: 5,
    persistent: true,
    trigger: () => {
      localStorage.setItem('ach_pageloads', (Number(localStorage.getItem('ach_pageloads') || '0') + 1).toString());
      return false;
    },
  },
  {
    name: 'Achievement Viewer',
    desc: 'View your achievements',
    points: 5,
  },
  {
    name: 'Do Nothing 1',
    desc: 'Do nothing for 5 seconds',
    points: 5,
  },
  {
    name: 'Do Nothing 2',
    desc: 'Do nothing for 1 minute',
    points: 10,
  },
  {
    name: 'Do Nothing 3',
    desc: 'Do nothing for 10 minutes',
    points: 20,
  },
  {
    name: 'Do Nothing 4',
    desc: 'Do nothing for 30 minutes',
    points: 100,
  },
  {
    name: 'Do Nothing 5',
    desc: 'Do nothing for 1 hour',
    points: 500,
  },
  {
    name: 'Do Nothing 6',
    desc: 'Do nothing for 2 hours',
    points: 1000,
  },
  {
    name: 'Do Nothing 7',
    desc: 'Do nothing for 6 hours',
    points: 2500,
  },
  {
    name: 'Touch Grass',
    desc: 'Do nothing for a day',
    points: 5000,
  },
  {
    name: 'Mouse Mover',
    desc: 'Move the mouse! Or finger.',
    points: 5,
    persistent: true,
    event: 'mousemove',
    callback: (event: MouseEvent): boolean => {
      localStorage.setItem(
        'ach_mousedistance',
        (
          Number(localStorage.getItem('ach_mousedistance') || '0') +
          Math.abs(event.movementX) +
          Math.abs(event.movementY)
        ).toString(),
      );
      return true;
    },
  },
  {
    name: 'Secret Achievement',
    desc: 'Very sneaky...',
    points: 99,
  },
  {
    name: 'Clicker',
    desc: 'You sure love clicking something!',
    points: 5,
    persistent: true,
    event: 'click',
    callback: (_event: MouseEvent): boolean => {
      localStorage.setItem('ach_mouseclicks', (Number(localStorage.getItem('ach_mouseclicks') || '0') + 1).toString());
      return true;
    },
  },
  {
    name: 'Touchscreen User',
    desc: 'You can touch! Wow!',
    points: 5,
    event: 'touchstart',
    callback: (_event: TouchEvent): boolean => {
      return true;
    },
  },
  {
    name: 'The First of Many',
    desc: 'The image where the journey began',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/images/0');
    },
  },
  {
    name: 'Nice',
    desc: 'Seks number is very funny',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('69');
    },
  },
  {
    name: 'Image Viewer',
    desc: 'View any image!',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/images');
    },
  },
  {
    name: 'Khajit Has the Wares',
    desc: '...if you have the coin',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/commissions');
    },
  },
  {
    name: 'What a bunch of losers',
    desc: 'Visit the site staff page',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/staff');
    },
  },
  {
    name: 'Index Get',
    desc: "That's a lot of zeroes...",
    points: 10,
    trigger: () => {
      return window.location.pathname.includes('000000');
    },
  },
  {
    name: 'Resetter',
    desc: 'Reset all your achievements',
    points: 10,
  },
  {
    name: 'Uploader',
    desc: "You're gonna upload, right? Right?",
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/images/new');
    },
  },
  {
    name: 'Debater',
    desc: 'Visit the forums',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/forums');
    },
  },
  {
    name: 'Clicker 2',
    desc: 'Click 5 times, impressive achievement',
    points: 5,
    event: 'click',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mouseclicks')) >= 5;
    },
  },
  {
    name: 'Clicker 3',
    desc: 'Click 20 times, keep going...',
    points: 10,
    event: 'click',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mouseclicks')) >= 20;
    },
  },
  {
    name: 'Clicker 4',
    desc: 'Click 100 times, yes, more!',
    points: 20,
    event: 'click',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mouseclicks')) >= 100;
    },
  },
  {
    name: 'Clicker 5',
    desc: 'Click 500 times, almost there!',
    points: 30,
    event: 'click',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mouseclicks')) >= 500;
    },
  },
  {
    name: 'Clicker God',
    desc: 'Click 1000 times, ahh, bliss!',
    points: 50,
    event: 'click',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mouseclicks')) >= 1000;
    },
  },
  {
    name: 'Upvoter',
    desc: 'Upvote something!',
    points: 10,
    persistent: true,
    event: 'imageinteract',
    callback: (event: CustomEvent): boolean => {
      const { type, id, method, data } = event.detail;

      if (type === 'vote' && method === 'POST' && data.up && !upvotedIds.includes(id)) {
        upvotedIds.push(id);

        localStorage.setItem('ach_upvotes', (Number(localStorage.getItem('ach_upvotes') || '0') + 1).toString());

        return true;
      } else if (type === 'vote' && method === 'DELETE' && upvotedIds.includes(id)) {
        upvotedIds.splice(upvotedIds.indexOf(id), 1);

        localStorage.setItem(
          'ach_upvotes',
          Math.max(Number(localStorage.getItem('ach_upvotes') || '0') - 1, 0).toString(),
        );

        return true;
      }

      return false;
    },
  },
  {
    name: 'Upvoter 2',
    desc: 'Upvote 10 images!',
    points: 20,
    event: 'imageinteract',
    callback: (_event: CustomEvent): boolean => {
      return Number(localStorage.getItem('ach_upvotes')) >= 10;
    },
  },
  {
    name: 'Upvoter 3',
    desc: 'Upvote 50 images!',
    points: 30,
    event: 'imageinteract',
    callback: (_event: CustomEvent): boolean => {
      return Number(localStorage.getItem('ach_upvotes')) >= 50;
    },
  },
  {
    name: 'Upvoter God',
    desc: 'Upvote 100 images!',
    points: 50,
    event: 'imageinteract',
    callback: (_event: CustomEvent): boolean => {
      return Number(localStorage.getItem('ach_upvotes')) >= 100;
    },
  },
  {
    name: 'Mouse Mover 2',
    desc: 'Move the mouse over 1000 pixels',
    points: 5,
    event: 'mousemove',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mousedistance')) >= 1000;
    },
  },
  {
    name: 'Mouse Mover 3',
    desc: 'Move the mouse over 10K pixels',
    points: 10,
    event: 'mousemove',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mousedistance')) >= 10000;
    },
  },
  {
    name: 'Mouse Mover 4',
    desc: 'Move the mouse over 100K pixels',
    points: 20,
    event: 'mousemove',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mousedistance')) >= 100000;
    },
  },
  {
    name: 'Mouse Mover 5',
    desc: 'Move the mouse over 1M pixels',
    points: 30,
    event: 'mousemove',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mousedistance')) >= 1000000;
    },
  },
  {
    name: 'The Great Mouser',
    desc: 'Move the mouse over 10M pixels',
    points: 50,
    event: 'mousemove',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mousedistance')) >= 10000000;
    },
  },
  {
    name: 'Mouse Mover Infinity',
    desc: 'Move the mouse a bit too hard',
    points: 1,
    event: 'mousemove',
    callback: (_event: MouseEvent): boolean => {
      return Number(localStorage.getItem('ach_mousedistance')) < -1;
    },
  },
  {
    name: "Wait, that's just the homepage",
    desc: 'Always has been',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/activity');
    },
  },
  {
    name: 'Home, sweet home',
    desc: 'Visit the homepage',
    points: 5,
    trigger: () => {
      return window.location.pathname === '/';
    },
  },
  {
    name: 'Exhibitionist',
    desc: 'View the galleries list',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/galleries');
    },
  },
  {
    name: 'Mom look I am on TV',
    desc: 'View the livestreams directory',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/channels');
    },
  },
  {
    name: 'Seeker',
    desc: 'Search for something!',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/search');
    },
  },
  {
    name: 'Reverse Seeker',
    desc: 'Search for an image which you already have',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/search/reverse');
    },
  },
  {
    name: 'Wall of Green',
    desc: 'Visit the tags directory',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/tags');
    },
  },
  {
    name: 'Sensational Headlines',
    desc: 'View recent comments',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/comments');
    },
  },
  {
    name: 'Trendy Brandy',
    desc: 'View currently trending images',
    points: 5,
    trigger: () => {
      return window.location.search.includes('?q=first_seen_at.gt:3%20days%20ago');
    },
  },
  {
    name: 'Manuscripts of the Ancients',
    desc: 'View a static page',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/pages');
    },
  },
  {
    name: 'Read the Rules',
    desc: 'Seriously, read them, carefully.',
    points: 10,
    trigger: () => {
      return window.location.pathname.includes('/pages/rules');
    },
  },
  {
    name: 'Page Loader 2',
    desc: 'Load 5 pages',
    points: 10,
    trigger: () => {
      return Number(localStorage.getItem('ach_pageloads')) >= 5;
    },
  },
  {
    name: 'Page Loader 3',
    desc: 'Load 20 pages',
    points: 15,
    trigger: () => {
      return Number(localStorage.getItem('ach_pageloads')) >= 20;
    },
  },
  {
    name: 'Page Loader 4',
    desc: 'Load 50 pages',
    points: 20,
    trigger: () => {
      return Number(localStorage.getItem('ach_pageloads')) >= 50;
    },
  },
  {
    name: 'Page Loader 5',
    desc: 'Load 500 pages',
    points: 30,
    trigger: () => {
      return Number(localStorage.getItem('ach_pageloads')) >= 500;
    },
  },
  {
    name: 'Page Loader God',
    desc: 'Load 1000 pages',
    points: 50,
    trigger: () => {
      return Number(localStorage.getItem('ach_pageloads')) >= 1000;
    },
  },
  {
    name: 'Faver',
    desc: 'Favorite something!',
    points: 10,
    persistent: true,
    event: 'imageinteract',
    callback: (event: CustomEvent): boolean => {
      const { type, id, method } = event.detail;

      if (type === 'fave' && method === 'POST' && !favedIds.includes(id)) {
        favedIds.push(id);

        localStorage.setItem('ach_faves', (Number(localStorage.getItem('ach_faves') || '0') + 1).toString());

        return true;
      } else if (type === 'fave' && method === 'DELETE' && favedIds.includes(id)) {
        favedIds.splice(favedIds.indexOf(id), 1);

        localStorage.setItem('ach_faves', Math.max(Number(localStorage.getItem('ach_faves') || '0') - 1, 0).toString());

        return true;
      }

      return false;
    },
  },
  {
    name: 'Faver 2',
    desc: 'Favorite 10 images!',
    points: 20,
    event: 'imageinteract',
    callback: (_event: CustomEvent): boolean => {
      return Number(localStorage.getItem('ach_faves')) >= 10;
    },
  },
  {
    name: 'Faver 3',
    desc: 'Favorite 50 images!',
    points: 30,
    event: 'imageinteract',
    callback: (_event: CustomEvent): boolean => {
      return Number(localStorage.getItem('ach_faves')) >= 50;
    },
  },
  {
    name: 'Faver God',
    desc: 'Favorite 100 images!',
    points: 50,
    event: 'imageinteract',
    callback: (_event: CustomEvent): boolean => {
      return Number(localStorage.getItem('ach_faves')) >= 100;
    },
  },
  {
    name: "I swear I'm 18",
    desc: 'Visit the filters page',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/filters');
    },
  },
  {
    name: 'Private Communications',
    desc: 'Visit the private messages page',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/conversations');
    },
  },
  {
    name: 'Latest Happenings',
    desc: "At least these don't make that chirping noise...",
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/notifications');
    },
  },
  {
    name: "It's you!",
    desc: 'Visit your own user profile',
    points: 10,
    trigger: () => {
      const nameHeader = $<Element>('.profile-top__name-header');

      if (nameHeader) {
        // eslint-disable-next-line
        return nameHeader.innerHTML.includes((window.booru as any).userName);
      }

      return false;
    },
  },
  {
    name: 'Stalker Behavior',
    desc: "Stalk someone's user profile",
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/profiles');
    },
  },
  {
    name: 'Tag Editor',
    desc: 'Edit some tags',
    points: 10,
    persistent: true,
    event: 'click',
    callback: (event: PointerEvent): boolean => {
      if ((event.target as Element).id.includes('edit_save_button')) {
        localStorage.setItem('ach_tagedits', (Number(localStorage.getItem('ach_tagedits') || '0') + 1).toString());
        return true;
      }

      return false;
    },
  },
  {
    name: 'Tagger 2',
    desc: 'Edit tags 5 times',
    points: 20,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_tagedits')) >= 5;
    },
  },
  {
    name: 'Tagger 3',
    desc: 'Edit tags 20 times',
    points: 30,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_tagedits')) >= 20;
    },
  },
  {
    name: 'Tagger 4',
    desc: 'Edit tags 50 times',
    points: 50,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_tagedits')) >= 50;
    },
  },
  {
    name: 'Tag God',
    desc: 'Edit tags 100 times',
    points: 100,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_tagedits')) >= 100;
    },
  },
  {
    name: 'Eww Anthro',
    desc: "...but seriously if you don't like it, just filter it, rather than commenting on it, you know who you are.",
    points: 5,
    trigger: () => {
      if (window.location.pathname.includes('/images')) {
        const tags = $<HTMLInputElement>('#tags-form_old_tag_input');

        if (tags && tags.value.includes('anthro')) {
          return true;
        }
      }

      return false;
    },
  },
  {
    name: 'Spicy Browsing',
    desc: "Let's hope you're not at work",
    points: 5,
    trigger: () => {
      if (window.location.pathname.includes('/images')) {
        const tags = $<HTMLInputElement>('#tags-form_old_tag_input');

        if (
          tags &&
          (tags.value.includes('explicit') || tags.value.includes('questionable') || tags.value.includes('suggestive'))
        ) {
          return true;
        }
      }

      return false;
    },
  },
  {
    name: 'Fearless Browsing',
    desc: "Use the 'Everything' filter",
    points: 5,
    trigger: () => {
      // eslint-disable-next-line
      return (window.booru as any).filterId === 56027;
    },
  },
  {
    name: 'Shameless Plug',
    desc: 'Locate the artist tags of the site admins',
    points: 10,
    trigger: () => {
      if (window.location.pathname.includes('/images')) {
        const tags = $<HTMLInputElement>('#tags-form_old_tag_input');

        if (tags && (tags.value.includes('artist:nighty') || tags.value.includes('artist:the smiling pony'))) {
          return true;
        }
      }

      return false;
    },
  },
  {
    name: 'Furry!',
    desc: 'Fluffy critters, these things... fluffy critters',
    points: 5,
    trigger: () => {
      if (window.location.pathname.includes('/images')) {
        const tags = $<HTMLInputElement>('#tags-form_old_tag_input');

        if (tags && (tags.value.includes('furry') || tags.value.includes('furrified') || tags.value.includes('fox'))) {
          return true;
        }
      }

      return false;
    },
  },
  {
    name: 'Gamer',
    desc: 'Input the Konami code',
    points: 30,
    event: 'input',
    callback: (event: InputEvent): boolean => {
      return (event.target as TextInputElement)?.value?.toLowerCase() === 'up up down down left right left right';
    },
  },
  {
    name: 'True Gamer',
    desc: 'Input the full Konami code',
    points: 50,
    event: 'input',
    callback: (event: InputEvent): boolean => {
      return (
        (event.target as TextInputElement)?.value?.toLowerCase() === 'up up down down left right left right b a start'
      );
    },
  },
  {
    name: 'Best Pony',
    desc: 'Type the name of the best pony',
    points: 5,
    event: 'input',
    callback: (event: InputEvent): boolean => {
      return (event.target as TextInputElement)?.value?.toLowerCase().includes('trixie');
    },
  },
  {
    name: 'The Other Best Pony',
    desc: 'Type the name of the ACTUAL best pony',
    points: 10,
    event: 'input',
    callback: (event: InputEvent): boolean => {
      return (event.target as TextInputElement)?.value?.toLowerCase().includes('luna');
    },
  },
  {
    name: 'Cry About It',
    desc: 'Complain about the event',
    points: 0,
    event: 'input',
    callback: (event: InputEvent): boolean => {
      const text = (event.target as TextInputElement)?.value?.toLowerCase();

      if (text) {
        return (
          text.includes('event') &&
          (text.includes('bad') || text.includes('sucks') || text.includes('worst') || text.includes('hate'))
        );
      }

      return false;
    },
  },
  {
    name: 'Thanks',
    desc: 'Praise the event',
    points: 10,
    event: 'input',
    callback: (event: InputEvent): boolean => {
      const text = (event.target as TextInputElement)?.value?.toLowerCase();

      if (text) {
        return (
          text.includes('event') &&
          (text.includes('good') ||
            text.includes('better') ||
            text.includes('best') ||
            text.includes('great') ||
            text.includes('amazing') ||
            text.includes('love') ||
            text.includes('like'))
        );
      }

      return false;
    },
  },
  {
    name: 'Eww Politics',
    desc: 'Say something political',
    points: 5,
    event: 'input',
    callback: (event: InputEvent): boolean => {
      const str = (event.target as TextInputElement)?.value?.toLowerCase();

      if (str) {
        return (
          str.includes('trump') ||
          str.includes('elon') ||
          str.includes('musk') ||
          str.includes('putin') ||
          str.includes('jinping') ||
          str.includes('russia') ||
          str.includes('china') ||
          str.includes('usa') ||
          str.includes('political') ||
          str.includes('politics')
        );
      }

      return false;
    },
  },
  {
    name: '😳',
    desc: 'L-Lewd...',
    points: 10,
    trigger: () => {
      if (window.location.pathname.includes('/images')) {
        const tags = $<HTMLInputElement>('#tags-form_old_tag_input');

        if (tags && tags.value.includes('holding hooves')) {
          return true;
        }
      }

      return false;
    },
  },
  {
    name: 'Pepper',
    desc: 'Spot a repper',
    points: 10,
    trigger: () => {
      const senderNames = $$<Element>('.communication__body__sender-name');

      if (senderNames) {
        let repperSpotted = false;

        senderNames.forEach(el => {
          if (el.innerHTML.includes('/profiles/RepentantAnon')) {
            repperSpotted = true;
          }
        });

        return repperSpotted;
      }

      return false;
    },
  },
  {
    name: 'Scroller',
    desc: 'Scroll the page',
    points: 5,
    persistent: true,
    event: 'scroll',
    callback: (_event: Event): boolean => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      const currentScrollValue = Number(localStorage.getItem('ach_scroll') || '0');
      const newScrollValue = currentScrollValue + delta;

      lastScrollY = window.scrollY;
      localStorage.setItem('ach_scroll', newScrollValue.toString());

      if (scrollIter % 100 === 0) {
        if (newScrollValue > 10000000) {
          unlockAchievement(87);
          unlockAchievement(86);
          unlockAchievement(85);
          unlockAchievement(84);
          unlockAchievement(83);
        } else if (newScrollValue > 1000000) {
          unlockAchievement(86);
          unlockAchievement(85);
          unlockAchievement(84);
          unlockAchievement(83);
        } else if (newScrollValue > 100000) {
          unlockAchievement(85);
          unlockAchievement(84);
          unlockAchievement(83);
        } else if (newScrollValue > 10000) {
          unlockAchievement(84);
          unlockAchievement(83);
        } else if (newScrollValue > 1000) {
          unlockAchievement(83);
        }
      }

      scrollIter += 1;

      return true;
    },
  },
  {
    name: 'Scroller 2',
    desc: 'Scroll 1000 pixels',
    points: 5,
  },
  {
    name: 'Scroller 3',
    desc: 'Scroll 10K pixels',
    points: 15,
  },
  {
    name: 'Scroller 4',
    desc: 'Scroll 100K pixels',
    points: 20,
  },
  {
    name: 'Scroller 5',
    desc: 'Scroll 1M pixels',
    points: 30,
  },
  {
    name: 'Scroller God',
    desc: 'Scroll 10M pixels',
    points: 50,
  },
  {
    name: 'Downvote = Ban',
    desc: 'Locate the artist tags of the site staff',
    points: 10,
    trigger: () => {
      if (window.location.pathname.includes('/images')) {
        const tags = $<HTMLInputElement>('#tags-form_old_tag_input');

        if (tags) {
          return (
            tags.value.includes('artist:nighty') ||
            tags.value.includes('artist:the smiling pony') ||
            tags.value.includes('artist:appledash') ||
            tags.value.includes('artist:cheezedoodle96') ||
            tags.value.includes('artist:ciaran') ||
            tags.value.includes('artist:dragonpone') ||
            tags.value.includes('artist:lightningbolt') ||
            tags.value.includes('artist:sky-spark') ||
            tags.value.includes('artist:mildgyth') ||
            tags.value.includes('artist:moonatik') ||
            tags.value.includes('artist:nittany discord') ||
            tags.value.includes('artist:notadeliciouspotato') ||
            tags.value.includes('artist:saby') ||
            tags.value.includes('artist:stasyan1902') ||
            tags.value.includes('artist:celestialflare') ||
            tags.value.includes('artist:yoditax')
          );
        }
      }

      return false;
    },
  },
  {
    name: 'Help Me',
    desc: 'Site staff provide many opportunities for contacting them',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/pages/contact');
    },
  },
  {
    name: 'Thorty Dorra Plz',
    desc: 'Consider the benefits of the Derpibooru Premium subscription!',
    points: 5,
    trigger: () => {
      return window.location.pathname.includes('/pages/donations');
    },
  },
  {
    name: 'Upvoter Overlord',
    desc: 'Upvote 1000 images!',
    points: 150,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_upvotes')) >= 1000;
    },
  },
  {
    name: 'Faver Overlord',
    desc: 'Favorite 1000 images!',
    points: 150,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_faves')) >= 1000;
    },
  },
  {
    name: 'Upvoter Infinity',
    desc: 'Upvote 10000 images!',
    points: 500,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_upvotes')) >= 10000;
    },
  },
  {
    name: 'Faver Infinity',
    desc: 'Favorite 10000 images!',
    points: 500,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_faves')) >= 10000;
    },
  },
  {
    name: 'Tag Overlord',
    desc: 'Edit tags 250 times',
    points: 250,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_tagedits')) >= 250;
    },
  },
  {
    name: 'The Living Tag',
    desc: 'Edit tags 1000 times',
    points: 1000,
    event: 'click',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_tagedits')) >= 1000;
    },
  },
  {
    name: 'Commenter',
    desc: 'Post a comment',
    points: 5,
    persistent: true,
    event: 'submit',
    callback: (event: SubmitEvent): boolean => {
      if ((event.target as Element)?.id === 'js-comment-form') {
        localStorage.setItem('ach_comments', (Number(localStorage.getItem('ach_comments') || '0') + 1).toString());
        return true;
      }
      return false;
    },
  },
  {
    name: 'Wall Poster',
    desc: 'If you get this achievement you are holding it wrong',
    points: 1,
    persistent: true,
    event: 'submit',
    callback: (event: SubmitEvent): boolean => {
      if (
        window.location.pathname.includes('/forums/') &&
        window.location.pathname.includes('/topics/') &&
        !window.location.pathname.includes('/edit') &&
        !(event.target as Element).classList.contains('header__search')
      ) {
        localStorage.setItem('ach_posts', (Number(localStorage.getItem('ach_posts') || '0') + 1).toString());
      }

      return false;
    },
  },
  {
    name: 'Commenter 2',
    desc: 'Post 5 comments',
    points: 10,
    event: 'submit',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_comments')) >= 5;
    },
  },
  {
    name: 'Commenter 3',
    desc: 'Post 10 comments',
    points: 15,
    event: 'submit',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_comments')) >= 10;
    },
  },
  {
    name: 'Commenter 4',
    desc: 'Post 25 comments',
    points: 30,
    event: 'submit',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_comments')) >= 25;
    },
  },
  {
    name: 'Commenter 5',
    desc: 'Post 50 comments',
    points: 75,
    event: 'submit',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_comments')) >= 50;
    },
  },
  {
    name: 'Commenter God',
    desc: 'Post 100 comments',
    points: 150,
    event: 'submit',
    callback: (_event: PointerEvent): boolean => {
      return Number(localStorage.getItem('ach_comments')) >= 100;
    },
  },
  {
    name: 'Poster',
    desc: 'Post a reply to a forum topic',
    points: 5,
    trigger: (): boolean => {
      return Number(localStorage.getItem('ach_posts')) >= 1;
    },
  },
  {
    name: 'Poster 2',
    desc: 'Post 5 replies to forum topics',
    points: 10,
    trigger: (): boolean => {
      return Number(localStorage.getItem('ach_posts')) >= 5;
    },
  },
  {
    name: 'Poster 3',
    desc: 'Post 10 replies to forum topics',
    points: 15,
    trigger: (): boolean => {
      return Number(localStorage.getItem('ach_posts')) >= 10;
    },
  },
  {
    name: 'Poster 4',
    desc: 'Post 25 replies to forum topics',
    points: 30,
    trigger: (): boolean => {
      return Number(localStorage.getItem('ach_posts')) >= 25;
    },
  },
  {
    name: 'Poster 5',
    desc: 'Post 50 replies to forum topics',
    points: 75,
    trigger: (): boolean => {
      return Number(localStorage.getItem('ach_posts')) >= 50;
    },
  },
  {
    name: 'Poster God',
    desc: 'Post 100 replies to forum topics',
    points: 150,
    trigger: (): boolean => {
      return Number(localStorage.getItem('ach_posts')) >= 100;
    },
  },
  {
    name: 'The Beginning',
    desc: 'Your journey begins! Unlock any achievement.',
    points: 5,
  },
  {
    name: 'The Plot Thickens',
    desc: 'You earned enough points for a silver trophy, keep it up!',
    points: 10,
  },
  {
    name: 'Getting Stronger',
    desc: 'At 900 points you are eligible for a gold trophy, you really are good at this.',
    points: 20,
  },
  {
    name: 'Hard Stuck Plat',
    desc: "Platinum trophy is obtained at 1500 points! I bet you hope you don't get stuck at this level.",
    points: 30,
  },
  {
    name: 'DIAMONDS!!!',
    desc: 'Your quest has led you to obtain the diamond trophy at 2500 point!',
    points: 50,
  },
  {
    name: 'The One',
    desc: 'You are the one true gamer (5000 points).',
    points: 100,
  },
  {
    name: "IT'S OVER 9000!!!",
    desc: 'Obtain more than 9000 points.',
    points: 250,
  },
  {
    name: "Journey's End",
    desc: 'Unlock every single other achievement.',
    points: 11020,
  },
];

function isAchievementUnlocked(achs: string, id: number): boolean {
  return achs.match(new RegExp(`\\b${id}\\b`)) !== null;
}

function unlockAchievement(id: number) {
  const achs = localStorage.getItem('achievements') || '';
  const newAchs = localStorage.getItem('new_achievements') || '';

  if (!isAchievementUnlocked(achs, id)) {
    if (achs !== '') {
      localStorage.setItem('achievements', `${achs},${id}`);
    } else {
      localStorage.setItem('achievements', `${id}`);
    }

    if (newAchs !== '') {
      localStorage.setItem('new_achievements', `${newAchs},${id}`);
    } else {
      localStorage.setItem('new_achievements', `${id}`);
    }
  }
}

function getAchievementScore(): number {
  return (localStorage.getItem('achievements') || '').split(',').reduce((acc, id) => {
    const a = achievements[Number(id)];

    if (a && Number.isInteger(a.points)) {
      return acc + a.points;
    }
    return acc;
  }, 0);
}

function setupAchievementPoints() {
  setInterval(() => {
    const score = getAchievementScore();

    if (score > 0) {
      unlockAchievement(110);
    }

    if (score >= 400) {
      unlockAchievement(111);
    }

    if (score >= 900) {
      unlockAchievement(112);
    }

    if (score >= 1500) {
      unlockAchievement(113);
    }

    if (score >= 2500) {
      unlockAchievement(114);
    }

    if (score >= 5000) {
      unlockAchievement(115);
    }

    if (score > 9000) {
      unlockAchievement(116);
    }

    if (score >= 13980) {
      unlockAchievement(117);
    }
  }, 2000);
}

function setupDoNothing() {
  setInterval(() => {
    const diff = Date.now() - doingNothingSince;

    if (diff >= 60000 * 60 * 24) {
      unlockAchievement(9);
    }

    if (diff >= 60000 * 300) {
      unlockAchievement(8);
    }

    if (diff >= 60000 * 120) {
      unlockAchievement(7);
    }

    if (diff >= 60000 * 60) {
      unlockAchievement(6);
    }

    if (diff >= 60000 * 30) {
      unlockAchievement(5);
    }

    if (diff >= 600000) {
      unlockAchievement(4);
    }

    if (diff >= 60000) {
      unlockAchievement(3);
    }

    if (diff >= 5000) {
      unlockAchievement(2);
    }
  }, 5000);
}

function setupAchievements() {
  const achs = localStorage.getItem('achievements') || '';

  unlockAchievement(0);

  achievements.forEach((a: Achievement, idx: number) => {
    if (a.persistent || !isAchievementUnlocked(achs, idx)) {
      if (a.event) {
        window.addEventListener(a.event, (event: Event) => {
          doingNothingSince = Date.now();

          if (a.callback && a.callback(event) === true) {
            unlockAchievement(idx);
          }
        });
      }

      if (a.trigger && a.trigger() === true) {
        unlockAchievement(idx);
      }
    }
  });
}

function resetAchievements() {
  localStorage.setItem('achievements', '');
  localStorage.setItem('new_achievements', '');
  localStorage.setItem('ach_upvotes', '0');
  localStorage.setItem('ach_mouseclicks', '0');
  localStorage.setItem('ach_mousedistance', '0');
  localStorage.setItem('ach_pageloads', '0');
  localStorage.setItem('ach_faves', '0');
  localStorage.setItem('ach_tagedits', '0');
  localStorage.setItem('ach_scroll', '0');
  localStorage.setItem('ach_comments', '0');
  localStorage.setItem('ach_posts', '0');
}

function unlockAllAchievements() {
  achievements.forEach((_, idx) => {
    unlockAchievement(idx);
  });
}

function renderAchievements() {
  /* Achievements page */
  const el = $<Element>('#react-outlet');

  if (el) {
    const rootEl = createRoot(el);
    rootEl.render(createElement(Achievements));
  }

  /* Achievement animation overlay */
  const ovEl = $<Element>('#react-overlay-outlet');

  if (ovEl) {
    const rootEl = createRoot(ovEl);
    rootEl.render(createElement(Overlay));
    ovEl.classList.remove('hidden');
  }
}

function setupAchievementElements() {
  setupAchievements();
  setupDoNothing();
  setupAchievementPoints();
  renderAchievements();
}

function getDoingNothingSince(): number {
  return doingNothingSince;
}

function validateAchievements() {
  // eslint-disable-next-line
  const booru = window.booru as any;
  const realAchs = (localStorage.getItem('achievements') || '').split(',').filter(id => {
    const nId = Number(id);
    const a = achievements[nId];

    if (a && Number.isInteger(a.points) && a.points % 5 === 0) {
      if (window.booru.userIsSignedIn) {
        switch (nId) {
          case 104:
            return booru.userPosts >= 1;
          case 105:
            return booru.userPosts >= 5;
          case 106:
            return booru.userPosts >= 10;
          case 107:
            return booru.userPosts >= 25;
          case 108:
            return booru.userPosts >= 50;
          case 109:
            return booru.userPosts >= 100;
          case 97:
            return booru.userComments >= 1;
          case 99:
            return booru.userComments >= 5;
          case 100:
            return booru.userComments >= 10;
          case 101:
            return booru.userComments >= 25;
          case 102:
            return booru.userComments >= 50;
          case 103:
            return booru.userComments >= 100;
          case 28:
            return booru.userVotes >= 1;
          case 29:
            return booru.userVotes >= 10;
          case 30:
            return booru.userVotes >= 50;
          case 31:
            return booru.userVotes >= 100;
          case 91:
            return booru.userVotes >= 1000;
          case 93:
            return booru.userVotes >= 10000;
          case 54:
            return booru.userFaves >= 1;
          case 55:
            return booru.userFaves >= 10;
          case 56:
            return booru.userFaves >= 50;
          case 57:
            return booru.userFaves >= 100;
          case 92:
            return booru.userFaves >= 1000;
          case 94:
            return booru.userFaves >= 10000;
          case 63:
            return booru.userMetadataUpdates >= 1;
          case 64:
            return booru.userMetadataUpdates >= 5;
          case 65:
            return booru.userMetadataUpdates >= 20;
          case 66:
            return booru.userMetadataUpdates >= 50;
          case 67:
            return booru.userMetadataUpdates >= 100;
          case 95:
            return booru.userMetadataUpdates >= 250;
          case 96:
            return booru.userMetadataUpdates >= 1000;
          default:
            return true;
        }
      }

      return true;
    }

    return false;
  });

  localStorage.setItem('achievements', realAchs.join(','));

  if (window.booru.userIsSignedIn) {
    localStorage.setItem(
      'ach_upvotes',
      Math.min(Number(localStorage.getItem('ach_upvotes') || '0'), booru.userVotes).toString(),
    );
    localStorage.setItem(
      'ach_faves',
      Math.min(Number(localStorage.getItem('ach_faves') || '0'), booru.userFaves).toString(),
    );
    localStorage.setItem(
      'ach_tagedits',
      Math.min(Number(localStorage.getItem('ach_tagedits') || '0'), booru.userMetadataUpdates).toString(),
    );
    localStorage.setItem(
      'ach_comments',
      Math.min(Number(localStorage.getItem('ach_comments') || '0'), booru.userComments).toString(),
    );
    localStorage.setItem(
      'ach_posts',
      Math.min(Number(localStorage.getItem('ach_posts') || '0'), booru.userPosts).toString(),
    );
  }
}

export {
  setupAchievementElements,
  resetAchievements,
  unlockAchievement,
  isAchievementUnlocked,
  unlockAllAchievements,
  getDoingNothingSince,
  validateAchievements,
  achievements,
};
