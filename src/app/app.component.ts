import { Component } from '@angular/core';
import { Preset } from '../classes/preset';
import { formatNumber } from '@angular/common';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  helpIsVisible = false;
  pickingPreset = false;
  memesEnabled = true;
  tickStart: number;
  timePassed: number;
  timer: any;
  ave1 = 0;
  ave2 = 0;
  status = 'stop';
  minutes = 0;
  seconds = 0;
  preset: Preset;
  presets: Preset[];

  currentTrack: 0;
  currentSequence: String[];
  tracks = [
    '0',
    '1',
    '10',
    '100',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '1h',
    '1m',
    '1s',
    '2',
    '20',
    '200',
    '2h',
    '2m',
    '2s',
    '3',
    '30',
    '300',
    '4',
    '40',
    '400',
    '5',
    '50',
    '500',
    '5h',
    '5m',
    '5s',
    '6',
    '60',
    '600',
    '7',
    '70',
    '700',
    '8',
    '80',
    '800',
    '9',
    '90',
    '900',
    'passed',
    'remained',
    'start',
    'stop',
    'time-is-over',
    'zhgi-mochi',
    'pause',
    'resume',
    '1f',
    '2f',
    'ave1',
    'ave2'
    ];

  title = 'web-timer';

  constructor () {
    this.presets = Preset.all();
    this.selectPreset(this.presets[0]);
    this.pickPreset();
  }
  ngAfterViewInit () {
    this.currentSequence = [];
    this.preload();
  }

  pickPreset () {
    this.pickingPreset = true;
  }

  selectPreset(preset) {
    if (this.status === 'active') {
      this.stop();
    }
    this.reset();
    this.preset = preset;
    this.pickingPreset = false;
  }
  showHelp () {
    this.helpIsVisible = true;
  }
  hideHelp () {
    this.helpIsVisible = false;
  }
  toggleMemes () {
    this.memesEnabled = !this.memesEnabled;
  }

  currentTime () {
    const d = new Date();
    return d.getTime();
  }
  elapsedTime () {
    return this.currentTime() - this.tickStart + this.timePassed;
  }

  reset () {
    this.timePassed = 0;
    this.minutes = 0;
    this.seconds = 0;
  }

  start () {
    console.log('start');
    this.reset();
    this.tickStart = this.currentTime();
    this.timer = setInterval(() => {
      this.tick();
    }, 100);
    this.status = 'active';
    this.speak(['start']);
    this.ave1 = 0;
    this.ave2 = 0;
    if (this.memesEnabled) {
      // Plan AVE!
      if (this.preset.duration > 10 && (Math.random() > 0.6)) {
        this.ave1 = 15 + 60 * Math.floor(Math.random() * this.preset.duration - 2);
      }
      if (this.preset.duration > 20 && (Math.random() > 0.5)) {
        this.ave2 = 45 + 60 * Math.floor(Math.random() * this.preset.duration - 2);
      }
    }
  }

  stop () {
    console.log('stop');
    this.reset();
    this.status = 'stop';
    clearInterval(this.timer);
    this.speak(['stop']);
  }

  complete () {
    console.log('complete');
    this.status = 'stop';
    clearInterval(this.timer);
    this.speak(['finish']);
  }

  pause () {
    console.log('pause');
    clearInterval(this.timer);
    this.tick();
    this.tickStart = this.currentTime();
    this.status = 'pause';
    this.speak(['pause']);
  }

  resume () {
    console.log('resume');
    this.tickStart = this.currentTime();
    this.timer = setInterval(() => {
      this.tick();
    }, 100);
    this.status = 'active';
    this.speak(['resume']);
  }

  tick () {
    const seconds = Math.floor(this.timePassed / 1000);
    const minutes = Math.floor(this.timePassed / 60000);
    this.timePassed = this.elapsedTime();
    this.tickStart = this.currentTime();
    if (this.timePassed >= (seconds + 1) * 1000) {
      // this.newSecond();
      const interval = Math.floor(this.elapsedTime() / 1000);
      if (interval === this.ave1) {
        this.speak(['ave1']);
      }
      if (interval === this.ave2) {
        this.speak(['ave2']);
      }
      this.seconds = interval % 60;
      this.minutes = Math.floor(interval / 60);
      this.updateWindowTitle();

      const phrase = this.preset.onTick(this.minutes, this.seconds % 60);
      // console.log(this.seconds, seconds, phrase)
      if (phrase.length) {
        this.speak(phrase);
      }
    }
    if (this.timePassed >= (this.preset.duration) * 60000) {
      this.complete();
    }
  }

  updateWindowTitle () {
    document.title = '[' +
      formatNumber(this.minutes, 'en', '2.0-3') +
      ':' +
      formatNumber(this.seconds, 'en', '2.0-3') +
    ']';
  }

  speak (speech: string[]) {
    this.shutUp();
    this.currentTrack = 0;
    this.currentSequence = speech.map(e => {
      switch (e) {
        case 'finish':
          if (this.memesEnabled) {
            return 'time-is-over';
          } else {
            return 'stop';
          }
        case 'start':
          if (this.memesEnabled) {
            return 'zhgi-mochi';
          } else {
            return 'start';
          }
        default:
          return e;
      }
    });
    this.nextWord();
  }
  speakQuantity (prefix: string, qty: number, units: string) {
    const speech = [];
    if (prefix) {
      speech.push(prefix);
    }
    if (qty > 20) {
      const dd = Math.floor(qty / 10);
      const mm = qty % 10;
      if (dd) {
        speech.push(String(dd * 10));
      }
      switch (mm) {
        case 0:
          if (units) {
            speech.push('5' + units);
          }
          break;
        default:
          speech.push(String(mm));
          if (units) {
            speech.push('5' + units);
          }
          break;
        case 1:
          speech.push(String(mm) + 'f');
          if (units) {
            speech.push('1' + units);
          }
          break;
        case 2:
          speech.push(String(mm) + 'f');
          if (units) {
            speech.push('2' + units);
          }
          break;
        case 3:
        case 4:
          speech.push(String(mm));
          if (units) {
            speech.push('2' + units);
          }
          break;
      }
    } else if (qty >= 10) {
      speech.push(String(qty));
      if (units) {
        speech.push('5' + units);
      }
    } else {
      switch (qty) {
        default:
          speech.push(String(qty));
          if (units) {
            speech.push('5' + units);
          }
          break;
        case 1:
          speech.push(String(qty) + 'f');
          if (units) {
            speech.push('1' + units);
          }
          break;
        case 2:
          speech.push(String(qty) + 'f');
          if (units) {
            speech.push('2' + units);
          }
          break;
        case 3:
        case 4:
          speech.push(String(qty));
          if (units) {
            speech.push('2' + units);
          }
          break;
      }
    }
    this.speak(speech);
  }
  minutesPassed (minutes: number) {
    this.speakQuantity('passed', minutes, 'm');
  }
  minutesRemained (minutes) {
    this.speakQuantity('remained', minutes, 'm');
  }
  secondsPassed (seconds) {
    this.speakQuantity('passed', seconds, 's');
  }
  secondsRemained (seconds) {
    this.speakQuantity('remained', seconds, 's');
  }
  secondsLastDozen (seconds) {
    this.speakQuantity('', seconds, '');
  }

  shutUp () {
    const currentTrack = this.currentSequence[this.currentTrack];
    if (currentTrack) {
      const e = document.getElementById('track_' + currentTrack);
      e['pause']();
    }
  }

  nextWord () {
    if (this.currentTrack < this.currentSequence.length) {
      const currentTrack = this.currentSequence[this.currentTrack];
      setTimeout(() => {
        const e = document.getElementById('track_' + currentTrack);
        e['muted'] = false;
        e['play']();
        this.currentTrack++;
      }, 100);
    }
  }

  ended() {
    this.nextWord();
  }

  preload () {
    this.tracks.forEach(track => {
      const e = document.getElementById('track_' + track);
      e['muted'] = true;
      e['play']();
    });
  }
}
