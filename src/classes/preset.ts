export class Preset {
  static assign (config: any) {
    return new Preset(
      config.id,
      config.name,
      config.duration,
      config.every,
      config.countdown,
      config.final,
      config.last30,
      config.last10
    );
  }

  static all(): Preset[] {
    const defaultPreset = {
      id: 'volpo',
      name: 'Стандарт+',
      duration: 16,
      every: 2,
      countdown: 9,
      final: 2,
      last30: 1,
      last10: 1
    };
    const ftbrPreset = {
      id: 'ftbr',
      name: 'ФТБР',
      duration: 30,
      every: 5,
      countdown: 20,
      final: 3,
      last30: 1,
      last10: 1
    };
    const gfPreset = {
      id: 'gf',
      name: 'Золотая муха',
      duration: 15,
      every: 5,
      countdown: 9,
      final: 3,
      last30: 1,
      last10: 1
    };
    const brPreset = {
      id: 'br',
      name: 'Бенчрест',
      duration: 20,
      every: 5,
      countdown: 11,
      final: 3,
      last30: 1,
      last10: 1
    };
    const practicePreset = {
      id: 'pr',
      name: 'Пристрелка',
      duration: 10,
      every: 5,
      countdown: 9,
      final: 3,
      last30: 1,
      last10: 1
    };
    const training5Preset = {
      id: 'tr5',
      name: 'Короткая тренировка',
      duration: 5,
      every: 0,
      countdown: 0,
      final: 5,
      last30: 1,
      last10: 1
    };
    const training10Preset = {
      id: 'tr10',
      name: 'Тренировка',
      duration: 10,
      every: 2,
      countdown: 5,
      final: 3,
      last30: 1,
      last10: 1
    };
    const basicPreset = {
      id: 'scrub1',
      name: 'Одна минута',
      duration: 1,
      every: 0,
      countdown: 0,
      final: 0,
      last30: 1,
      last10: 1
    };
    return [
      defaultPreset,
      ftbrPreset,
      gfPreset,
      brPreset,
      practicePreset,
      training5Preset,
      training10Preset,
      basicPreset
    ].map(e => Preset.assign(e));
  }

  constructor (
    public id: string,
    public name: string,
    public duration: number,
    public every: number,
    public countdown: number,
    public final: number,
    public last30: boolean,
    public last10: boolean
  ) {}

  onTick (minutes: number, seconds: number) {
    const minutesRemained = this.duration - minutes;
    if (minutesRemained === 1) {
      // Последняя минута
      const secondsRemained = 60 - seconds;
      if (this.last30 && (secondsRemained === 30 || secondsRemained === 20)) {
        return this.secondsRemained(secondsRemained);
      } else if (this.last30 && secondsRemained === 10 && !this.last10) {
        return this.secondsRemained(secondsRemained);
      } else if (this.last10 && secondsRemained <= 10) {
        return this.secondsLastDozen(secondsRemained);
      }
    } else if (seconds === 0) {
      if (minutesRemained && this.final && minutesRemained <= this.final) {
        return this.minutesRemained(minutesRemained);
      } else if (minutes && this.every && minutes % this.every === 0) {
        if (minutes < this.countdown) {
          return this.minutesPassed(minutes);
        } else if (minutesRemained) {
          return this.minutesRemained(minutesRemained);
        }
      }
    }
    return [];
  }

  minutesPassed (minutes) {
    return this.speakQuantity('passed', minutes, 'm');
  }

  minutesRemained (minutes) {
    return this.speakQuantity('remained', minutes, 'm');
  }

  secondsPassed (seconds) {
    return this.speakQuantity('passed', seconds, 's');
  }

  secondsRemained (seconds) {
    return this.speakQuantity('remained', seconds, 's');
  }

  secondsLastDozen (seconds) {
    return this.speakQuantity('', seconds, '');
  }

  speakQuantity (prefix, qty, units) {
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
    return speech;
  }

}
