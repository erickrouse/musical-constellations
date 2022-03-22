import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import * as Tone from 'tone';
import { FMSynth, PluckSynth, PolySynth } from 'tone';
import { Instrument } from 'tone/build/esm/instrument/Instrument';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  stars: string[] = [];
  randomColor: string = this.randomHue();
  hidden: boolean = false;
  muted: boolean = true;
  numLoops: number = -1;

  loopSynth: Tone.PolySynth = new Tone.PolySynth({
    volume: -100
  }).toDestination();

  bassSynth: Tone.FMSynth = new Tone.FMSynth({
    volume: -100
  }).toDestination();

  doubleBassSynth: Tone.MonoSynth = new Tone.MonoSynth({
    volume: -100,
    oscillator: {
      type: 'fmsine21'
    }
  }).toDestination();

  tenorSynth: Tone.PolySynth = new Tone.PolySynth({
    volume: -100
  }).toDestination();

  doubleTenorSynth: Tone.MonoSynth = new Tone.MonoSynth({
    volume: -100,
    oscillator: {
      type: 'triangle',
    },
    envelope: {
      attack: 2
    }
  }).toDestination();

  sopranoSynth: Tone.PolySynth = new Tone.PolySynth({
    volume: -100
  }).toDestination();
  
  synth = new Tone.PolySynth({
    volume: -100
  }).toDestination();

  loopParts = [this.loopSynth, this.bassSynth, this.doubleBassSynth, this.tenorSynth, this.doubleTenorSynth, this.sopranoSynth];

  envelope = new Tone.Envelope({
    attack: 1,
    decay: 1,
    release: 1,
    sustain: 1
  }).toDestination();
  feedbackDelay = new Tone.FeedbackDelay(.25, .95).toDestination();
  reverb = new Tone.Reverb(10).toDestination();
  filter = new Tone.Filter(80, "lowpass").toDestination();

  notes = ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'];

  constructor() { }

  ngOnInit(): void {
    this.makeStars();
    this.fadeIn();
    this.colorSwatch();
    this.loop();
    document.addEventListener('dblclick', () => {
      this.reset();
      this.addLayer(this.muted);
    });
    document.addEventListener('keypress', event => {
      if (event.key == 'c' || event.key == ' ') {
        this.newColor();
      }
    });
    this.synth.connect(this.feedbackDelay);
    this.synth.connect(this.reverb);
    this.synth.connect(this.envelope);
    this.synth.connect(this.filter);
    this.loopSynth.connect(this.reverb);
  }

  reset() {
    this.stars = [];
    ++this.numLoops;
  }

  addLayer(fromMute: boolean) {
    this.loopParts.forEach(loop => {
      if (this.numLoops >= this.loopParts.indexOf(loop)) {
        if (loop == this.loopSynth) {
          loop.connect(this.reverb);
        }
        if (!this.muted && fromMute) {
          loop.volume.value = -8;
          if (loop == this.bassSynth) {
            loop.volume.value = -5;
          }  
        } else if (!this.muted) {
          loop.volume.rampTo(-8, 2);
          if (loop == this.bassSynth) {
            loop.volume.rampTo(-5, 2);
          }
        }
      } else {
        loop.volume.value = -100;
      }
    });
  }
  
  toggleMute() {
    if (this.muted) {
      this.muted = !this.muted;
      this.addLayer(true);
     
      this.synth.volume.value = -14;
      this.feedbackDelay = new Tone.FeedbackDelay(.25, .8).toDestination();
      this.synth.connect(this.feedbackDelay);
      Tone.Transport.start();
    } else { 
      this.muted = !this.muted;
      this.synth.volume.value = -100;
      this.feedbackDelay.disconnect();

      this.loopParts.forEach(synth => synth.volume.value = -100);
    }
  }
  
  loop() {
    const loopSynth = this.loopSynth;

    const pattern = new Tone.Pattern(function(time, note) {
      loopSynth.triggerAttackRelease(note, 1);
    }, ['C4', 'F4', 'G4', 'C4', 'F4', 'G4', 'D4', 'F4', 'G4', 'D4', 'F4', 'G4']);
    
    const bassSynth = this.bassSynth;
    
    const bassPattern = new Tone.Pattern(function(time, note) {
      bassSynth.triggerAttackRelease(note, 4.5);
    }, ['Ab2', 'Bb2', 'Ab2', 'Bb2', 'Ab2', 'Bb2', 'Ab2', 'G2',]);
    bassPattern.playbackRate = 1/6;

    const doubleBassSynth = this.doubleBassSynth;

    const doubleBassPattern = new Tone.Pattern(function(time, note) {
      doubleBassSynth.triggerAttackRelease(note, 4.5);
    }, ['Ab1', 'Bb1', 'Ab1', 'Bb1', 'Ab1', 'Bb1', 'Ab1', 'G1']);
    doubleBassPattern.playbackRate = 1/6;

    const tenorSynth = this.tenorSynth;

    const tenorPattern = new Tone.Pattern(function(time, note) {
      tenorSynth.triggerAttackRelease(note, 1.125);
    }, ['Ab2', 'Eb3', 'F3', 'Bb3', 'Ab2', 'Eb3', 'F3', 'Bb3', 'Bb2', 'Eb3', 'G3', 'C4', 'Bb2', 'Eb3', 'G3', 'C4']);
    tenorPattern.playbackRate = 4/3;

    const doubleTenorSynth = this.doubleTenorSynth;

    const doubleTenorPattern = new Tone.Pattern(function(time, note) {
      doubleTenorSynth.triggerAttackRelease(note, 1.125);
    }, ['Ab3', 'Eb4', 'F4', 'Bb4', 'Ab3', 'Eb4', 'F4', 'Bb4', 'Bb3', 'Eb4', 'G4', 'C5', 'Bb3', 'Eb4', 'G4', 'C5']);
    doubleTenorPattern.playbackRate = 4/3;

    const sopranoSynth = this.sopranoSynth;

    const sopranoSynthPattern = new Tone.Pattern(function(time, note) {
      sopranoSynth.triggerAttackRelease(note, .125);
    }, ['G6', 'F6', 'D6', 'Eb6', 'F6', 'Eb6', 'G5', 'F5', 'C6', 'Bb5', 
    'G5', 'Ab5', 'Bb6', 'G6', 'F6', 'Eb6']);
    sopranoSynthPattern.playbackRate = 5/3;

    pattern.start(0);
    bassPattern.start(0);
    doubleBassPattern.start(0);
    tenorPattern.start(0);
    doubleTenorPattern.start(0);
    sopranoSynthPattern.start(0);
    Tone.Transport.bpm.value = 75;
  }
  
  newColor() {
    this.randomColor = this.randomHue();
    document.getElementById('swatch')?.remove();
    document.getElementById('swatch2')?.remove();
    this.colorSwatch();
  }

  deleteAll() {
    let lines = document.getElementsByClassName('line');
    Array.from(lines).forEach(line => {
      line.remove();
    });

    this.numLoops = -1;
    this.addLayer(false);
  }

  connectingLine(starId: string) {
    if (this.stars.indexOf(starId) == -1) {
      this.stars.unshift(starId);
    }

    if (this.stars.length > 1) {

      const star1 = document.getElementById(this.stars[0]);
      //@ts-ignore
      const off1 = this.getOffset(star1);
      const star2 = document.getElementById(this.stars[1]);
      //@ts-ignore
      const off2 = this.getOffset(star2);

      const x1 = off1.left + off1.width;
      const y1 = off1.top + off1.height;
     
      const x2 = off2.left + off2.width;
      const y2 = off2.top;
      
      const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
      
      const cx = ((x1 + x2) / 2) - (length / 2);
      const cy = ((y1 + y2) / 2) - (1 / 2);
      
      const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180.00 / Math.PI);
      
      const line = document.createElement('div');

      line.classList.add('line');

      line.style.padding = "0px"; line.style.margin = '0px'; line.style.height = '1px'; line.style.backgroundColor = this.randomColor;
      line.style.lineHeight = "1px"; line.style.position = "absolute"; line.style.left = cx + 'px'; line.style.top = cy + 'px';
      line.style.width = length + 'px'; line.style.transform = "rotate(" + angle + "deg)";
      line.style.boxShadow = "0 0 7px 5px " + this.randomColor; line.style.zIndex = "0"

      document.querySelector('#main')?.appendChild(line);
      this.stars.splice(1, 1);
    }
  }

  getOffset(element: HTMLElement) {
    var rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width || element.offsetWidth,
      height: rect.height || element.offsetHeight
    };
  }

  colorSwatch() {
    const div = document.querySelector('.current-color');
    const whenMenuHidden = document.querySelector('#color-hidden-menu');

      let swatch = document.createElement('div');
      let swatch2 = document.createElement('div');
      const swatches = [swatch, swatch2];
    
      swatches.forEach(s => {
        s.style.backgroundColor = this.randomColor;
        s.style.height = '30px';
        s.style.width = '30px';
        s.style.display = "block";
        s.style.border = "1px solid hsl(0, 0%, 79%)";
      });

    swatch2.setAttribute('id', 'swatch2');
    swatch2.style.border = "1px solid hsl(233, 78%, 9%)";
    whenMenuHidden?.appendChild(swatch2);
    swatch.setAttribute('id', 'swatch');
    div?.appendChild(swatch);
  }

  showHide() {
    const centerBlock = document.getElementById('center-block');
    const whenMenuHidden = document.getElementById('color-hidden-menu');
    this.hidden = !this.hidden;
    if (this.hidden) {
      //@ts-ignore
      centerBlock?.style.display = "none";
      //@ts-ignore
      whenMenuHidden?.style.display = "flex";
    }else {
      //@ts-ignore
      centerBlock?.style.display = "flex";
      //@ts-ignore
      whenMenuHidden?.style.display = "none";
    }
  }

  makeStars() {
    const main = document.querySelector('#main');
    let idCounter = 1;

    for (let i = 0; i < 1000; i++) {
      let star = document.createElement('div');
      star.style.width = this.randomNum(1, 4) + 'px';
      star.style.height = star.style.width;
      star.style.opacity = this.randomNum(50, 100) + "%";
      //@ts-ignore
      star.style.left = this.randomNum(1, main?.getBoundingClientRect().right) + 'px';
      //@ts-ignore
      star.style.top = this.randomNum(1, main?.getBoundingClientRect().bottom) + 'px';
      star.style.animationDuration = this.randomNum(1, 6) + 's';
      star.style.zIndex = '1';
      star.classList.add('star');
      star.classList.add('fade-in');
      star.id = 'star' + idCounter;
      star.addEventListener('click', () => {
        this.connectingLine(star.id);
        //@ts-ignore
        this.synth.triggerAttackRelease(this.notes[this.randomNum(0, 6)] + this.randomNum(5, 8), '4n');
        // star.style.transform = "scaleZ(2)";
      });
      main?.append(star);
      idCounter++;
    }
  }

  fadeIn() {
    document.querySelectorAll('.fade-in').forEach(star => {
      star.classList.remove('fade-in');
    });
  }

  randomHue(): string {
    return `hsl(${this.randomNum(0, 355)}, 97%, 72%)`;
  }

  randomNum(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
