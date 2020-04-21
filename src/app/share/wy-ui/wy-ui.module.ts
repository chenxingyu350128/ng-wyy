import { NgModule } from '@angular/core';
import { SingleSheetComponent } from './single-sheet/single-sheet.component';
import { PlayCountPipe } from '../play-count.pipe';
import { WyPlayerModule } from './wy-player/wy-player.module';
// import { WySliderComponent } from './wy-slider/wy-slider.component';



@NgModule({
  declarations: [
    SingleSheetComponent,
    PlayCountPipe,
    // WySliderComponent
  ],
  imports: [
    WyPlayerModule
  ],
  exports: [
    SingleSheetComponent,
    PlayCountPipe,
    WyPlayerModule
  ]
})
export class WyUiModule { }
