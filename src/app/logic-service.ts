import { Injectable } from "@angular/core";
import { Cell } from "./cell";

@Injectable({
    providedIn: 'root'
})

export class LogicService {

    impossible: boolean = false;
    resolved: boolean = false;
    iteration: number = 0

    constructor() { }

    // fill val in the grid where the value is 100% sure
    resolve(tableValues: any): Cell[][] {
        let grid: Cell[][] = this.transformTo2D(tableValues)

        ////// fill possibilities depending on, this should be done only once
        this.fillPossibilityForValDependOnExistingValues(grid);
        while (!this.resolved && !this.impossible) {
            this.iteration++;
            this.impossible = true;

            grid = this.startCycle(grid);
            this.resolved = this.isResolved(grid);
        }

        return grid
    }

    private startCycle(grid: Cell[][]): Cell[][] {

        this.fillMustValues(grid)

        this.fillCellHavingSinglePossibleValue(grid)

        this.removePossibilityDependOnOtherPossibilities(grid)

        this.removePossibilityFromOtherCellsIfGroupOfCellsHaveSamePossibilities(grid)

        return grid;
    }

    fillMustValues(grid: Cell[][]) {
        let emptyCells: Cell[] = this.getEmptyCells(grid);

        let needToValidate: boolean = true;
        for (let number = 1; number <= 9; number++) {
            needToValidate = true
            while (needToValidate) {
                needToValidate = this.fillMustValueForUniquePossibility(emptyCells, grid, number)
                emptyCells = this.getEmptyCells(grid);
            }
        }
    }

    fillCellHavingSinglePossibleValue(grid: Cell[][]) {
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                if (grid[row][col]?.possibilities?.length === 1 && !grid[row][col].value) {
                    this.fillValueInCell(grid, row, col, grid[row][col].possibilities[0])
                }
            }
        }
    }

    private isResolved(grid: Cell[][]): boolean {
        for (let row in grid) {
            for (let col in grid[row])
                if (!grid[row][col].value) {
                    return false;
                }
        }
        this.impossible = false
        return true;
    }

    getCellByCellName(grid: Cell[][], cellName: string): Cell {
        let row: number = +this.getTensFromCellName(cellName)
        let col: number = +this.getUnitFromCellName(cellName)
        return grid[row][col];
    }

    fillPossibilityForValDependOnExistingValues(grid: Cell[][]) {
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        for (let val = 1; val <= 9; val++) {

            emptyCells.forEach((cell) => {
                let cellRow: string = this.getTensFromCellName(cell.name)
                let cellCol: string = this.getUnitFromCellName(cell.name)
                if (!grid[+cellRow][+cellCol].possibilities.includes(val) && !this.isRowColBoxHasValue(val, +cellRow, +cellCol, grid)) {
                    this.addValueToPossibilities(+cellRow, +cellCol, grid, val)
                }
            })
        }
    }

    private removePossibilityDependOnOtherPossibilities(grid: Cell[][]) {
        let emptyCells = this.getEmptyCells(grid);
        for (let val = 1; val <= 9; val++) {
            emptyCells.forEach((emptyCell) => {
                let row: number = +this.getTens(emptyCell.index)
                let col: number = +this.getUnit(emptyCell.index)
                this.removePossibilityIfRowColHasMustPossibility(row, col, val, grid);
            })
        }
    }

    getSimilarPossibilityCellsInSameBox(grid: Cell[][], cellRow: number, cellCol: number): Cell[] | null {

        let similarPossibilityCellsBox: Cell[] | null = [grid[cellRow][cellCol]]

        let startingPosition = this.getBoxStartingPosition(cellRow, cellCol);

        let startingRow = +this.getTens(startingPosition);
        let startingCol = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                let isSameCell: boolean = (row === cellRow && col === cellCol)
                let cellHasNoValue: boolean = !this.isCellHasValue(grid, row, col)
                if (!isSameCell &&
                    cellHasNoValue &&
                    this.isArrayIncluded(grid[cellRow][cellCol].possibilities, grid[row][col].possibilities) // cellsHasSamePossibility
                ) {
                    similarPossibilityCellsBox.push(grid[row][col]);
                }

            }
        }
        // if number of possibilities equals number of cells i.e. if we have 3 cells, each has possibilities: 4,5,6 then for sure the three of them must be in their place and to be removed from others in the same box 
        if (grid[cellRow][cellCol].possibilities.length === similarPossibilityCellsBox.length) {
            return similarPossibilityCellsBox
        }

        return null;
    }

    getSimilarPossibilityCellsInSameRow(grid: Cell[][], cellRow: number, cellCol: number): Cell[] | null {
        let similarPossibilityCellsRow: Cell[] | null = [grid[cellRow][cellCol]]
        for (let col = 0; col <= 8; col++) {
            let isSameCell: boolean = (col === cellCol)
            let cellHasNoValue: boolean = !this.isCellHasValue(grid, cellRow, col)
            if (!isSameCell &&
                cellHasNoValue &&
                this.isArrayIncluded(grid[cellRow][cellCol].possibilities, grid[cellRow][col].possibilities)
            ) {
                similarPossibilityCellsRow.push(grid[cellRow][col]);
            }
        }
        // if number of possibilities equals number of cells i.e. if we have 3 cells, each has possibilities: 4,5,6 then for sure the three of them must be in their place and to be removed from others in the same box 
        if (grid[cellRow][cellCol].possibilities.length === similarPossibilityCellsRow.length) {
            return similarPossibilityCellsRow
        }
        return null;
    }

    getSimilarPossibilityCellsInSameCol(grid: Cell[][], cellRow: number, cellCol: number): Cell[] | null {
        let similarPossibilityCellsCol: Cell[] | null = [grid[cellRow][cellCol]]
        for (let row = 0; row <= 8; row++) {
            let isSameCell: boolean = (row === cellRow)
            let cellHasNoValue: boolean = !this.isCellHasValue(grid, row, cellCol)
            if (!isSameCell &&
                cellHasNoValue &&
                this.isArrayIncluded(grid[cellRow][cellCol].possibilities, grid[row][cellCol].possibilities)
            ) {
                similarPossibilityCellsCol.push(grid[row][cellCol]);
            }
        }
        // if number of possibilities equals number of cells i.e. if we have 3 cells, each has possibilities: 4,5,6 then for sure the three of them must be in their place and to be removed from others in the same box 
        if (grid[cellRow][cellCol].possibilities.length === similarPossibilityCellsCol.length) {
            return similarPossibilityCellsCol
        }
        return null;
    }

    removePossibilityFromOtherCellsIfGroupOfCellsHaveSamePossibilities(grid: Cell[][]) {
        this.removePossibilityFromBoxCellWhenGroupCellsHasSamePossibilities(grid);
        this.removePossibilityFromRowCellWhenGroupCellsHasSamePossibilities(grid);
        // this.removePossibilityFromColCellWhenGroupCellsHasSamePossibilities(grid);
    }

    removePossibilityFromBoxCellWhenGroupCellsHasSamePossibilities(grid: Cell[][]) {
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        for (let cellIndex in emptyCells) {
            let cellRow: number = +this.getTensFromCellName(emptyCells[cellIndex].name);
            let cellCol: number = +this.getUnitFromCellName(emptyCells[cellIndex].name);
            let similarPossibilityCellsBox: Cell[] | null = this.getSimilarPossibilityCellsInSameBox(grid, cellRow, cellCol)
            if (similarPossibilityCellsBox) {
                this.removeListOfPossibilitiesFromBoxExcept(grid, cellRow, cellCol, emptyCells[cellIndex].possibilities, similarPossibilityCellsBox)
            }
        }
    }

    removePossibilityFromRowCellWhenGroupCellsHasSamePossibilities(grid: Cell[][]) {
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        for (let cellIndex in emptyCells) {
            let cellRow: number = +this.getTensFromCellName(emptyCells[cellIndex].name);
            let cellCol: number = +this.getUnitFromCellName(emptyCells[cellIndex].name);
            let getSimilarPossibilityCellsInSameRow: Cell[] | null = this.getSimilarPossibilityCellsInSameRow(grid, cellRow, cellCol)
            if (getSimilarPossibilityCellsInSameRow) {
                this.removeListOfPossibilitiesFromRowExcept(grid, cellRow, emptyCells[cellIndex].possibilities, getSimilarPossibilityCellsInSameRow)
            }
        }
    }

    removePossibilityFromColCellWhenGroupCellsHasSamePossibilities(grid: Cell[][]) {
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        for (let cellIndex in emptyCells) {
            let cellRow: number = +this.getTensFromCellName(emptyCells[cellIndex].name);
            let cellCol: number = +this.getUnitFromCellName(emptyCells[cellIndex].name);
            let getSimilarPossibilityCellsInSameCol: Cell[] | null = this.getSimilarPossibilityCellsInSameCol(grid, cellRow, cellCol)
            if (getSimilarPossibilityCellsInSameCol) {
                this.removeListOfPossibilitiesFromColExcept(grid, cellRow, emptyCells[cellIndex].possibilities, getSimilarPossibilityCellsInSameCol)
            }
        }
    }

    isArrayIncluded(main: number[], sub: number[]): boolean {
        let allFounded = sub.every(ai => main.includes(ai));
        return allFounded
    }

    removePossibilityIfRowColHasMustPossibility(row: number, col: number, val: number, grid: Cell[][]) {
        for (let val = 1; val <= 9; val++) {
            if (this.rowHasMustPossibility(row, col, val, grid)
                || this.colHasMustPossibility(row, col, val, grid)) {
                this.removeValueFromPossibility(row, col, grid, val);
            }
        }
    }

    rowHasMustPossibility(cellRow: number, cellCol: number, val: number, grid: Cell[][]): boolean {
        for (let col = 0; col <= 8; col++) {
            let cellHasPossibility: boolean = grid[cellRow][col].possibilities.includes(val)
            let cellHasNoValue: boolean = !grid[cellRow][col].value
            if (cellHasPossibility && cellHasNoValue &&
                !this.isInTheSameBox(cellRow, cellCol, cellRow, col) &&
                !this.otherRowInOtherBoxHasPossibility(grid, val, cellRow, col))
                return true;

        }
        return false;
    }

    colHasMustPossibility(cellRow: number, cellCol: number, val: number, grid: Cell[][]): boolean {
        for (let row = 0; row <= 8; row++) {
            let cellHasPossibility: boolean = grid[row][cellCol].possibilities.includes(val)
            let cellHasNoValue: boolean = !grid[row][cellCol].value
            if (cellHasPossibility && cellHasNoValue &&
                !this.isInTheSameBox(row, cellCol, cellRow, cellCol) &&
                !this.otherColInOtherBoxHasPossibility(grid, val, row, cellCol))
                return true;
        }
        return false;
    }

    private otherRowInOtherBoxHasPossibility(grid: Cell[][], val: number, cellRow: number, cellCol: number) {
        let startingPosition: string = this.getBoxStartingPosition(cellRow, cellCol);
        let startingRow: number = +this.getTens(startingPosition);
        let startingCol: number = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            if (row !== cellRow) {

                for (let col = startingCol; col <= startingCol + 2; col++) {
                    if (grid[row][col] && grid[row][col].possibilities.includes(val)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private otherColInOtherBoxHasPossibility(grid: Cell[][], val: number, cellRow: number, cellCol: number) {
        let startingPosition: string = this.getBoxStartingPosition(cellRow, cellCol);
        let startingRow: number = +this.getTens(startingPosition);
        let startingCol: number = +this.getUnit(startingPosition);
        for (let col = startingCol; col <= startingCol + 2; col++) {
            if (col !== cellCol) {

                for (let row = startingRow; row <= startingRow + 2; row++) {
                    if (grid[row][col] && grid[row][col].possibilities.includes(val)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private isInTheSameBox(cell1Row: number, cell1Col: number, cell2Row: number, cell2Col: number): boolean {
        return this.getBoxStartingPosition(cell1Row, cell1Col) === this.getBoxStartingPosition(cell2Row, cell2Col);
    }

    private addValueToPossibilities(cellRow: number, cellCol: number, grid: any[][], val: number) {
        grid[+cellRow][+cellCol].possibilities.push(val)
    }

    private removeValueFromPossibility(cellRow: number, cellCol: number, grid: any[][], val: number): boolean {
        let array: number[] = grid[+cellRow][+cellCol]?.possibilities
        var index = array?.indexOf(val);
        if (index !== -1) {
            array.splice(index, 1);
            return true;
        }
        return false
    }


    fillMustValueForUniquePossibility(emptyCells: any, grid: Cell[][], val: number): boolean {
        // when cell can only host this value, other rows and cols are filled
        let anyCellIsFilled: boolean = false;
        emptyCells.forEach((cell: Cell) => {
            let cellRow: string = this.getTensFromCellName(cell.name)
            let cellCol: string = this.getUnitFromCellName(cell.name)
            let isPossibleToFill = grid[+cellRow][+cellCol].possibilities.includes(val)
            if (isPossibleToFill && this.hasUniquePossibility(+cellRow, +cellCol, val, grid)) {
                // congrats, set value here
                this.fillValueInCell(grid, +cellRow, +cellCol, val);
                anyCellIsFilled = true;
            }
        })
        // if any cell is filled, then we need to revalidate and try to fill the other boxes
        return anyCellIsFilled;
    }

    private fillValueInCell(grid: Cell[][], cellRow: number, cellCol: number, val: number) {
        grid[+cellRow][+cellCol] = { ...(grid[+cellRow][+cellCol]), value: val };
        this.impossible = false;
        this.removeAllPossibilities(grid, cellRow, cellCol, val);
    }

    private removeAllPossibilities(grid: Cell[][], cellRow: number, cellCol: number, val: number): number {
        grid[cellRow][cellCol].possibilities = []
        let numOfRemovedCellBox: number = this.removePossibilitiesFromBox(grid, cellRow, cellCol, val);
        let numOfRemovedCellRow: number = this.removePossibilitiesFromRow(grid, cellRow, val);
        let numOfRemovedCellCol: number = this.removePossibilitiesFromCol(grid, cellCol, val);
        return numOfRemovedCellBox + numOfRemovedCellRow + numOfRemovedCellCol
    }

    private removeListOfPossibilitiesFromBoxExcept(grid: Cell[][], cellRow: number, cellCol: number, vals: number[], exceptionCells: Cell[]): number {
        let numOfRemoveds: number = 0
        let startingPosition = this.getBoxStartingPosition(cellRow, cellCol);
        let startingRow = +this.getTens(startingPosition);
        let startingCol = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                if (!exceptionCells.includes(grid[row][col])) {
                    vals.forEach(val => {
                        if (this.removeValueFromPossibility(row, col, grid, val)) {
                            ++numOfRemoveds;
                        }
                    })
                    ++numOfRemoveds;
                }
            }
        }
        return numOfRemoveds;
    }



    private removePossibilitiesFromBox(grid: Cell[][], cellRow: number, cellCol: number, val: number): number {
        let numOfRemoveds: number = 0
        let startingPosition = this.getBoxStartingPosition(cellRow, cellCol);
        let startingRow = +this.getTens(startingPosition);
        let startingCol = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                if (this.removeValueFromPossibility(row, col, grid, val)) {
                    ++numOfRemoveds;
                }
            }
        }
        return numOfRemoveds;
    }

    private removeListOfPossibilitiesFromRowExcept(grid: Cell[][], cellRow: number, vals: number[], exceptionCells: Cell[]): number {
        let numOfRemoveds: number = 0;
        for (let col = 0; col <= 8; col++) {
            if (!exceptionCells.includes(grid[cellRow][col]))
                vals.forEach(val => {
                    if (this.removeValueFromPossibility(cellRow, col, grid, val)) {
                        ++numOfRemoveds;
                    }
                })
        }
        return numOfRemoveds;
    }

    private removeListOfPossibilitiesFromColExcept(grid: Cell[][], cellCol: number, vals: number[], exceptionCells: Cell[]): number {
        let numOfRemoveds: number = 0;
        for (let row = 0; row <= 8; row++) {
            if (!exceptionCells.includes(grid[row][cellCol]))
                vals.forEach(val => {
                    if (this.removeValueFromPossibility(row, cellCol, grid, val)) {
                        ++numOfRemoveds;
                    }
                })
        }
        return numOfRemoveds;
    }





    private removePossibilitiesFromRow(grid: Cell[][], cellRow: number, val: number): number {
        let numOfRemoveds: number = 0;
        for (let col = 0; col <= 8; col++) {
            if (this.removeValueFromPossibility(cellRow, col, grid, val)) {
                ++numOfRemoveds;
            }
        }

        return numOfRemoveds;
    }


    private removePossibilitiesFromCol(grid: Cell[][], cellCol: number, val: number): number {
        let numOfRemoveds: number = 0;

        for (let row = 0; row <= 8; row++) {
            if (this.removeValueFromPossibility(row, cellCol, grid, val)) {
                ++numOfRemoveds;
            }
        }
        return numOfRemoveds;
    }

    private removeListOfPossibilitiesFromCol(grid: Cell[][], cellCol: number, vals: number[]): number {
        let numOfRemoveds: number = 0;
        vals.forEach(val => {
            numOfRemoveds += this.removePossibilitiesFromCol(grid, cellCol, val);
        })
        return numOfRemoveds;
    }


    private hasUniquePossibility(cellRow: number, cellCol: number, val: number, grid: Cell[][]): boolean {
        // check if row, col and box has no possibility 
        if (!this.isBoxHasAnyOtherPossibility(grid, cellRow, cellCol, val) ||
            !this.isRowHasOtherPossibility(grid, cellRow, cellCol, val) ||
            !this.isColHasOtherPossibility(grid, cellRow, cellCol, val)) {
            return true;
        }
        return false;
    }

    isCellHasValue(grid: Cell[][], cellRow: number, cellCol: number): boolean {
        return !!grid[cellRow][cellCol].value
    }

    transformTo2D(tableValues: any): Cell[][] {

        let grid: Cell[][] = [];

        for (let row = 0; row <= 8; row++) {
            grid[row] = [];
            for (let col = 0; col <= 8; col++) {
                let index = row + '' + col
                let cellName = 'c' + index;
                let cell: Cell = { index: index, name: cellName, value: tableValues[cellName], possibilities: [], row: row, col: col }
                grid[row][col] = cell
            }
        }
        return grid;

    }

    private isRowColBoxHasValue(val: number, cellRow: number, cellCol: number, grid: Cell[][]): boolean {
        return this.isRowHasValue(grid, +cellRow, val) ||
            this.isColHasValue(grid, +cellCol, val) ||
            this.isBoxHasValue(grid, cellRow, cellCol, val);
    }



    private isRowHasValue(grid: Cell[][], row: number, val: number): boolean {
        for (let col = 0; col <= 8; col++) {
            if (grid[row][col] && grid[row][col].value === val) {
                return true;
            }
        }
        return false;
    }

    private isColHasValue(grid: Cell[][], col: number, val: number): boolean {
        for (let row = 0; row <= 8; row++) {
            if (grid[row][col] && grid[row][col].value === val) {
                return true;
            }
        }
        return false;
    }

    private isBoxHasAnyOtherPossibility(grid: Cell[][], cellRow: number, cellCol: number, val: number): boolean {
        let startingPosition = this.getBoxStartingPosition(cellRow, cellCol);
        let startingRow = +this.getTens(startingPosition);
        let startingCol = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                let isSameCell: boolean = (row === cellRow && col === cellCol)

                let cellHasPossibility: boolean = grid[row][col] && grid[row][col].possibilities.includes(val);
                let cellHasNoValue: boolean = !this.isCellHasValue(grid, cellRow, cellCol)
                if (!isSameCell && cellHasNoValue && cellHasPossibility) {
                    return true;
                }
            }
        }
        return false;
    }

    isRowHasOtherPossibility(grid: Cell[][], cellRow: number, cellCol: number, val: number): boolean {
        for (let col = 0; col <= 8; col++) {
            let isSameCell: boolean = (col === cellCol)
            let hasOtherPossibility: boolean = grid[cellRow][col] && grid[cellRow][col].possibilities.includes(val);
            let cellHasNoValue: boolean = !this.isCellHasValue(grid, cellRow, cellCol)

            if (!isSameCell && hasOtherPossibility && cellHasNoValue) {
                return true;
            }
        }
        return false;
    }

    isColHasOtherPossibility(grid: Cell[][], cellRow: number, cellCol: number, val: number): boolean {
        for (let row = 0; row <= 8; row++) {
            let isSameCell: boolean = (row === cellRow)
            let hasOtherPossibility: boolean = grid[row][cellCol] && grid[row][cellCol].possibilities.includes(val);
            let cellHasNoValue: boolean = !this.isCellHasValue(grid, cellRow, cellCol)

            if (!isSameCell && hasOtherPossibility && cellHasNoValue) {
                return true;
            }
        }
        return false;
    }

    private isBoxHasValue(grid: Cell[][], cellRow: number, cellCol: number, val: number): boolean {
        let startingPosition: string = this.getBoxStartingPosition(cellRow, cellCol);
        let startingRow: number = +this.getTens(startingPosition);
        let startingCol: number = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                if (grid[row][col] && grid[row][col].value === val) {
                    return true;
                }
            }
        }
        return false;
    }

    private getBoxStartingPosition(cellRow: number, cellCol: number): string {
        let row = Math.floor((cellRow) / 3) * 3
        let col = Math.floor((cellCol) / 3) * 3
        let startingPosition: string = row + '' + col
        return startingPosition;
    }

    getEmptyCells(grid: Cell[][]): Cell[] {
        let emptyCells: Cell[] = []
        grid.forEach((tableRow: Cell[]) => {
            let row: Cell[] = tableRow;
            row.forEach((cell: Cell) => {
                if (!cell.value) {
                    emptyCells.push(cell)
                }
            })
        });
        return emptyCells;
    }

    private getTens(cellIndex: string): string {
        return Math.floor(+cellIndex / 10) + ''
    }

    private getUnit(cellIndex: string): string {
        return (+cellIndex % 10) + '';
    }


    private getTensFromCellName(cellName: string): string {
        return this.getTens(this.getCellIndex(cellName))
    }

    private getUnitFromCellName(cellName: string): string {
        return this.getUnit(this.getCellIndex(cellName))
    }

    getCellIndex(cellName: string): string {
        return cellName.substring(1, cellName.length);
    }

    goRight(elNum: string): string {
        return +this.getUnit(elNum) == 8 ? elNum : this.iUnit(elNum);
    }

    goDown(elNum: string) {
        return +this.getTens(elNum) == 8 ? elNum : this.iTens(elNum);
    }

    goLeft(elNum: string) {
        return +this.getUnit(elNum) == 0 ? elNum : this.dUnit(elNum);
    }

    goUp(elNum: string) {
        return +this.getTens(elNum) == 0 ? elNum : this.dTens(elNum);
    }

    private iUnit(num: string): string {
        let unit = this.getUnit(num)
        let tens = this.getTens(num)
        return tens + (+unit + 1)
    }

    private dUnit(num: string): string {
        let unit = this.getUnit(num)
        let tens = this.getTens(num)
        return tens + (+unit - 1)
    }


    private iTens(num: string): string {
        let unit = this.getUnit(num)
        let tens = this.getTens(num)
        return (+tens + 1) + unit
    }


    private dTens(num: string): string {
        let unit = this.getUnit(num)
        let tens = this.getTens(num)
        return (+tens - 1) + unit
    }


    transformToFormShape(grid: Cell[][]): any {
        let formShape: any = {}
        grid.forEach(row => {
            row.forEach(cell => {
                formShape[cell.name] = cell.value
            })
        })
        return formShape;
    }
}