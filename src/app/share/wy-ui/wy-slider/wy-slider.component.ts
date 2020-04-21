import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ElementRef, ViewChild, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { tap, pluck, map, distinctUntilChanged, takeUntil, filter } from 'rxjs/internal/operators';
import { SliderEventObserverConfig, SliderValue } from './wy-slider-types';
import { DOCUMENT } from '@angular/common';
import { sliderEvent, getElementOffset } from './sy-slider-helper';
import { Observable, fromEvent, merge } from 'rxjs';
import { inArray } from 'src/app/utils/array';
import { limitNumberInRange, getPercent } from 'src/app/utils/number';

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class WySliderComponent implements OnInit {
  @Input() wyVertical = false;
  @Input() wyMin = 0;
  @Input() wyMax = 100;

  private sliderDom: HTMLDivElement;
  private dragStart$: Observable<number>;
  private dragMove$: Observable<number>;
  private dragEnd$: Observable<Event>;

  value: SliderValue = null;
  offset: SliderValue = null;

  private isDragging = false;
  @ViewChild('wySlider', { static: true }) private wySlider: ElementRef;


  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log(this.wySlider)
    console.log(this.wySlider.nativeElement)
    this.sliderDom = this.wySlider.nativeElement
    this.createDraggingObservables()
    this.subscribeDrag(['start'])
  }

  private createDraggingObservables(){
    const orientField = this.wyVertical ? 'pageX' : 'pageY'
    const mouse: SliderEventObserverConfig = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup',
      filter: (e: MouseEvent) => e instanceof MouseEvent,
      pluckKey: [
        orientField
      ]
    };

    const touch: SliderEventObserverConfig = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend',
      filter: (e: TouchEvent) => e instanceof TouchEvent,
      pluckKey: [
        'touches',
        '0',
        orientField
      ]
    };

    [mouse, touch].forEach(source => {
      const {start, move, end, filter: filterFunc, pluckKey} = source;
      source.startPlucked$ = fromEvent(this.sliderDom, start)
      .pipe(
        filter(filterFunc),
        tap(sliderEvent),
        pluck(...pluckKey),
        map((position: number) => this.findCloseValue(position))
      )

      source.end$ = fromEvent(this.doc, end);
      source.moveResolved$ = fromEvent(this.doc, move)
      .pipe(
        filter(filterFunc),
        tap(sliderEvent),
        pluck(...pluckKey),
        distinctUntilChanged(),
        map((position: number) => this.findCloseValue(position)),
        takeUntil(source.end$)
      );
    })

    this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
    this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
    this.dragEnd$ = merge(mouse.end$, touch.end$);
  }

  private subscribeDrag(events: string[] = ['start', 'move', 'end']){
    if(inArray(events, 'start') && this.dragStart$){
      this.dragStart$.subscribe(this.onDragStart.bind(this))
    }
    if(inArray(events, 'move') && this.dragMove$){
      this.dragMove$.subscribe(this.onDragMove.bind(this))
    }
    if(inArray(events, 'end') && this.dragEnd$){
      this.dragEnd$.subscribe(this.onDragEnd.bind(this))
    }
  }

  private onDragStart(value: number){
    console.log('value:', value)
    this.toggleDragMoving(true);

  }

  private onDragMove(value: number){
    if(this.isDragging){
      this.setValue(value);
      this.cdr.markForCheck();
    }
  }

  private onDragEnd(){
    this.toggleDragMoving(false);
    this.cdr.markForCheck();

  }

  private setValue(value: SliderValue){
    this.value - value
    this.updateTrackAndHandles()
  }

  private updateTrackAndHandles(){
    this.offset = this.getValueToOffset(this.value);
    this.cdr.markForCheck();

  }

  private getValueToOffset(value: SliderValue): SliderValue{
    return getPercent(this.wyMin, this.wyMax, value)
  }
  private toggleDragMoving(movable: boolean){
    if(movable){
      this.isDragging = movable;
      this.subscribeDrag(['move', 'end'])
    }
    else{
      // this.unsubscribeDrag(['move', 'end'])

    }
  }

  private findCloseValue(position: number): number{
    //获取滑块总长
    const sliderLength = this.getSliderLength();
    //获取滑块起点的位置
    const sliderStart = this.getSliderStart()
    //滑块当前位置/总长
    const ratio = limitNumberInRange((position - sliderStart) / sliderLength, this.wyMin, this.wyMax)
    const ratioTrue = this.wyVertical ? 1 - ratio : ratio

    return ratioTrue * (this.wyMax - this.wyMin) + this.wyMin
  }

  private getSliderLength(): number{
    return this.wyVertical ? this.sliderDom.clientHeight : this.sliderDom.clientWidth;
  }
  private getSliderStart(): number{
    const offSet = getElementOffset(this.sliderDom)
    return this.wyVertical ? offSet.top : offSet.left;
  }
}
