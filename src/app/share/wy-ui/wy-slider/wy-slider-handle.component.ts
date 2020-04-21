import { Component, OnInit, Input, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { WySliderStyle } from './wy-slider-types';

@Component({
  selector: 'app-wy-slider-handle',
  template: `<div class="wy-slider-handle" [ngStyle]="style"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WySliderHandleComponent implements OnInit {

  @Input() wyVertical = false;
  @Input() wyOffset: number;
  constructor() { }
  style:WySliderStyle = {};
  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChange): void {
    if(changes['wyOffset']){
      this.style[this.wyVertical?'bottom':'left'] = this.wyOffset + '%';
    }
    throw new Error('Method not implemented')
  }

}
