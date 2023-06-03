import { Component, ElementRef, forwardRef, Injector, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Cell } from 'src/app/cell';
import { LogicService } from 'src/app/logic-service';


@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  host: { '(blur)': 'onTouched($event)' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CellComponent),
      multi: true
    }
  ]
})
export class CellComponent implements ControlValueAccessor, OnChanges {

  @Input() cell!: Cell;
  @Input() focusedCellName: string | undefined;

  control!: FormControl;

  @ViewChild('c') c!: ElementRef;

  constructor(private injector: Injector, private logicService: LogicService) { }

  onChange: any = () => { }
  onTouch: any = () => { }

  val = ""
  set value(val: string) {
    if (val !== this.value) {
      this.val = val;
      this.onChange(val);
    }
  }

  get value() {
    return this.val;
  }
  writeValue(value: any) {
    this.value = value
  }
  registerOnChange(fn: any) {
    this.onChange = fn
  }
  registerOnTouched(fn: any) {
    this.onTouch = fn
  }

  ngAfterViewInit(): void {
    const ngControl: any = this.injector.get(NgControl, null);
    if (ngControl) {
      setTimeout(() => {
        this.control = ngControl.control as FormControl;
      })
    }
  }

  onTouched(event: any) {
    this.onTouch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['focusedCellName']?.currentValue === this.cell.name) {
      this.c.nativeElement.focus()
    }
  }


  checkIfRequired(): boolean {
    const { validator } = this.control
    if (validator) {
      const validation = validator(new FormControl())
      return validation !== null && validation.required === true
    }
    return false;
  }

  getPossibilitesText(): string {
    let result: string = '{1}{2}{3} {4}{5}{6} {7}{8}{9}'
    for (let index in this.cell.possibilities) {
      let val: number = this.cell.possibilities[index];
      result = result.replace('{' + val + '}', val + '')
    }
    result = result.replace(/{\d}/g, '.')
    return result.substring(0, result.length);
  }

  getVal(){
    if(this.value){
      return this.value
    }
    return;
  }

  oninput(val: any){
    val=val.replace(/[^1-9]/g,'');val = val.replace(/\n/g,'')
  }
}
