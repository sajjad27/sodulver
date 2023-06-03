import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Cell } from 'src/app/cell';
import { testingFormControls } from 'src/app/data-service';
import { LogicService } from 'src/app/logic-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  impossible: boolean = false
  focusedCellName: string | undefined;

  grid: Cell[][] = []
  constructor(private logicService: LogicService) { }

  form!: FormGroup;

  ngOnInit() {
    this.initGrid()
    this.initForm()
  }

  initForm() {
    let formControls: any = {}
    this.grid.forEach(row => {
      row.forEach(cell => {
        formControls[cell.name] = new FormControl()
      })
    })
    formControls = testingFormControls;
    this.form = new FormGroup(
      formControls
    )

    this.grid = this.logicService.transformTo2D(this.form.value)

  }

  initGrid() {
    this.grid = this.logicService.transformTo2D({});
  }



  traverse(keyCode: number) {
    setTimeout(() => {
      let element = document.activeElement?.getAttribute('name') + '';
      let cellIndex: string = this.logicService.getCellIndex(element);

      if (keyCode === 37) {
        this.focusedCellName = 'c' + this.logicService.goLeft(cellIndex);
      } else if (keyCode === 38) {
        this.focusedCellName = 'c' + this.logicService.goUp(cellIndex);
      } else if (keyCode === 39) {
        this.focusedCellName = 'c' + this.logicService.goRight(cellIndex);
      } else if (keyCode === 40) {
        this.focusedCellName = 'c' + this.logicService.goDown(cellIndex);
      }
    });
  }

  getCell(cellName: string): Cell {
    return this.logicService.getCellByCellName(this.grid, cellName)
  }

  submitInWithEnter(event: any) {
    let keyCode: number = event.keyCode;
    if (keyCode === 13) {
      this.solve();
    } else {
      this.traverse(keyCode);
    }
  }

  solve() {
    const start = performance.now();

    this.grid = this.logicService.resolve(this.form.value)


    let solutionAsForm = this.logicService.transformToFormShape(this.grid)
    this.form.setValue(solutionAsForm)
    this.impossible = this.logicService.impossible;

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
  }

}
