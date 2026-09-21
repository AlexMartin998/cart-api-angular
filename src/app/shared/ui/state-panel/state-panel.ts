import { Component, input, output } from '@angular/core';

export type StateTone = 'loading' | 'empty' | 'error';

@Component({
  selector: 'app-state-panel',
  templateUrl: './state-panel.html',
})
export class StatePanel {
  readonly tone = input.required<StateTone>();
  readonly message = input.required<string>();
  readonly retryLabel = input<string | null>(null);

  readonly retry = output<void>();
}
