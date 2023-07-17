import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Cell } from 'src/app/cell';
import { puzzleLogStr, testingFormControls } from 'src/app/data-service';

import { LogicService } from 'src/app/logic-service';
import { RecognizerService } from 'src/app/recognizer-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  previewImageSrc: string | ArrayBuffer | null = null;

  numOfRows = 9
  numOfCols = 9
  loading: boolean = false

  impossible: boolean = false
  focusedCellName: string | undefined;

  grid: Cell[][] = []
  constructor(private logicService: LogicService, private ref: ChangeDetectorRef, private recognizerService: RecognizerService) { }

  form!: FormGroup;

  ngOnInit() {
    this.initGrid()
    this.initForm()
    this.solve()
    console.clear()
    this.removePossFromCol()
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
      if (document.activeElement) {
        let element = document.activeElement.getAttribute('name') + '';
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
        // to prevent expressionchangedafterithasbeencheckederror
        this.ref.detectChanges();
      }
    });
  }

  getCellNo(boxRow: string): string {
    return boxRow
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

  getCellsNumbersByBoxRowNoAndBoxNo(boxRowNo: number, boxNo: number): string[] {
    let cellsNumbers: string[] = []
    let startingPosition = (boxRowNo * 3) + '' + (boxNo * 3)
    let startingRow = +this.logicService.getTens(startingPosition);
    let startingCol = +this.logicService.getUnit(startingPosition);
    for (let row = startingRow; row <= startingRow + 2; row++) {
      for (let col = startingCol; col <= startingCol + 2; col++) {
        let cellName = 'c' + row + col
        cellsNumbers.push(cellName)
      }
    }
    return cellsNumbers
  }

  upload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (!file) {
      return;
    }

    this.reset()


    reader.onload = () => {
      this.previewImageSrc = reader.result;
    };
    reader.readAsDataURL(file);

    this.loading = true

    const start = performance.now();



    this.recognizerService.recognize(file).subscribe(

      puzzle => {
        this.loading = false
        this.form.setValue(puzzle)
        const end = performance.now();
        console.log(`Execution time: ${end - start} ms`);
      },
      error => {
        this.loading = false
        console.error('Upload error:', error);
      }
    );
  }

  logPuzzleForTesting() {
    let log = puzzleLogStr
    Object.keys(this.form.controls).forEach(key => {
      let strCellKey = '{' + (key ? key : '') + '}'
      let strCellVal = this.form.controls[key].value + ''
      log = log.replace(strCellKey, strCellVal)
    });

    console.log(log);
  }

  solve() {
    console.log(`this.grid`, this.grid);
    console.log(`this.form.value`, this.form.value);
    const start = performance.now();

    this.grid = this.logicService.transformTo2D(this.form.value)
    this.logicService.resolve(this.grid)
    this.form.setValue(this.logicService.transformToFormShape(this.grid))

    this.impossible = this.logicService.impossible;

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
  }

  iteration = 0
  next() {
    this.iteration = this.iteration + 1
    if (this.iteration === 1) {
      this.grid = this.logicService.transformTo2D(this.form.value)
      this.logicService.fillPossibilityForValDependOnExistingValues(this.grid);
    }
    this.logicService.startCycle(this.grid);
    this.form.setValue(this.logicService.transformToFormShape(this.grid))
    // this.grid = grid
    this.impossible = this.logicService.impossible

  }

  reset() {
    this.form.reset()
    this.initGrid()
    this.initForm()
    // this.ngOnInit()
    this.focusedCellName = undefined
    this.previewImageSrc = null
    this.impossible = false
  }

  logFormAndGrid() {
    console.log(`this.form.value`, this.form.value);
    console.log(`this.grid`, this.grid);
  }

  removePossFromCol() {
    this.logicService.removeHiddenDouble(this.grid)
  }

}
