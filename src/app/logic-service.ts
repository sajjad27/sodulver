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
    resolve(grid: Cell[][]): Cell[][] {
        this.impossible = false;
        this.resolved = false;
        this.iteration = 0
        ////// fill possibilities depending on, this should be done only once
        this.fillPossibilityForValDependOnExistingValues(grid);
        while (!this.resolved && !this.impossible) {
            this.iteration++;
            this.impossible = true;
            this.startCycle(grid);
            this.resolved = this.isResolved(grid);
        }
        return grid
    }

    startCycle(grid: Cell[][]) {
        this.fillMustValues(grid)

        this.fillCellHavingSinglePossibleValue(grid)

        this.removePossibilityDependOnOtherPossibilities(grid)

        this.removePossibilityFromOtherCellsIfGroupOfCellsHaveSamePossibilities(grid)

        this.removePossibilitiesByXWings(grid)

        this.removePossibilitiesByXYWings(grid)

        this.removeHiddenDouble(grid)
        // this.removeHiddenTriple(grid)
        // this.removeHiddenQuad(grid)

    }

    removeHiddenDouble(grid: Cell[][]) {
        // remove for box only
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        for (let cell1 of emptyCells) {
            let startingPosition = this.getBoxStartingPosition(cell1.row, cell1.col);

            let startingRow = +this.getTens(startingPosition);
            let startingCol = +this.getUnit(startingPosition);
            for (let row = startingRow; row <= startingRow + 2; row++) {
                for (let col = startingCol; col <= startingCol + 2; col++) {
                    let cell2 = grid[row][col]

                    let isSameCell: boolean = (row === cell1.row && col === cell1.col)
                    let cellHasNoValue: boolean = !this.isCellHasValue(grid, row, col)
                    let commonCandidates = this.getCommonCandidates(cell1, cell2);
                    let twoCommonCandidatesOnly = commonCandidates.length === 2



                    let commonCandidatesOnlyExistsInPair: number[] = []
                    for (let commonCandidate of commonCandidates) {
                        let cellsForCandidate = this.getCellsByCandidatesInBox(commonCandidate, grid, startingPosition)
                        if (cellsForCandidate.length === 2) {
                            commonCandidatesOnlyExistsInPair.push(commonCandidate)
                        }
                    }
                    if (cell1.row === 3 && cell1.col === 2
                        && cell2.row === 5 && cell2.col === 0) {
                        console.log(`isSameCell`, isSameCell);
                        console.log(`cellHasNoValue`, cellHasNoValue);
                        console.log(`commonCandidates`, commonCandidates);
                        console.log(`commonCandidatesOnlyExistsInPair`, commonCandidatesOnlyExistsInPair);
                    }
                    if (!isSameCell &&
                        cellHasNoValue &&
                        commonCandidatesOnlyExistsInPair.length === 2
                    ) {
                        // console.log('=================');
                        // console.log(`cell1`, cell1);
                        // console.log(`cell2`, cell2);
                        // console.log(`commonCandidate`, commonCandidates);
                        this.removeAllCandidatesFromCellExcept(cell1, grid, commonCandidatesOnlyExistsInPair);

                    }

                }
            }
            //     for (let cell2 of emptyCells) {
            //         let sameCell = cell1 === cell2
            //         if (sameCell || !this.isIntersected2Cells(cell1, cell2)) {
            //             continue;
            //         }
            //         let commonCandidate = this.getCommonCandidates(cell1, cell2);
            //         if (commonCandidate.length === 2) {
            //             console.log('=================');
            //             console.log(`cell1`, cell1);
            //             console.log(`cell2`, cell2);
            //             console.log(`commonCandidate`, commonCandidate);
            //         }
            //     }
        }

    }

    getCellsByCandidatesInBox(commonCandidate: number, grid: Cell[][], startingPosition: string): Cell[] {
        let cellsHavingOnlyCandidatesInBox: Cell[] = []
        // give me list of candidates and I will give you cells having the given gandidates (not only given candidates, cells might have other candidates)
        let startingRow = +this.getTens(startingPosition);
        let startingCol = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                let cell = grid[row][col]
                if (cell.possibilities.includes(commonCandidate)) {
                    cellsHavingOnlyCandidatesInBox.push(cell)
                }
            }
        }
        return cellsHavingOnlyCandidatesInBox
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
                if (grid[row][col].possibilities?.length === 1 && !grid[row][col].value) {
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
            // console.log(`grid[row][cellCol]`, grid[row][cellCol]);
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
        this.removePossibilityFromColCellWhenGroupCellsHasSamePossibilities(grid);
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
                this.removeListOfPossibilitiesFromColExcept(grid, cellCol, emptyCells[cellIndex].possibilities, getSimilarPossibilityCellsInSameCol)
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
        grid[+cellRow][+cellCol] = { ...(grid[+cellRow][+cellCol]), value: val, puzzleNumber: false };
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

    removeAllCandidatesFromCellExcept(cell: Cell, grid: Cell[][], candidates: number[]) {
        for (let candidate = 0; candidate <= 9; candidate++) {
            if (!candidates.includes(candidate)) {
                this.removeValueFromPossibility(cell.row, cell.col, grid, candidate)
            }
        }
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

    removePossibilitiesByXYWings(grid: Cell[][]) {
        let emptyCells: Cell[] = this.getEmptyCells(grid);

        for (let xCell of emptyCells) {
            for (let yCell of emptyCells) {
                let pivotCell: Cell | null = this.getPivotCell(xCell, yCell, grid)
            }
        }
    }

    getPivotCell(xCell: Cell, yCell: Cell, grid: Cell[][]): Cell | null {
        if (xCell.possibilities.length !== 2) {
            return null
        }
        let sameCell = xCell === yCell
        if (yCell.possibilities.length !== 2 || sameCell) {
            return null
        }

        let commonCandidate = this.getCommonCandidates(xCell, yCell);
        // only one common candidate should be between xyCells
        if (commonCandidate?.length !== 1) {
            return null
        }

        if (this.cellsAreIntersecting(xCell, yCell)) {
            return null;
        }

        let possiblePivotCells: Cell[] | null = this.getPossiblePivotCells(xCell, yCell, grid)
        // if (xCell.row === 6 && xCell.col === 2 && yCell.row === 7 && yCell.col === 8) {
        //     console.log(`helloo`, possiblePivotCells);
        // }

        if (possiblePivotCells) {
            const commonElements = xCell.possibilities.filter(candidate => yCell.possibilities.includes(candidate));
            let nonCommonCandidates: number[] = xCell.possibilities.concat(yCell.possibilities).
                filter(candidate => !commonElements.includes(candidate));

            for (let i = possiblePivotCells.length - 1; i >= 0; i--) {
                let pivotCell: Cell = possiblePivotCells[i]
                let isPivot = this.checkIfValidPivotCell(xCell, yCell, pivotCell, nonCommonCandidates)
                if (isPivot) {
                    console.log('==========================', '\n'
                        , `xCell`, xCell.row, xCell.col, '\n'
                        , `yCell`, yCell.row, yCell.col, '\n'
                        , `possiblePivotCells`, possiblePivotCells, '\n'
                        , `pivotCell`, pivotCell.row, pivotCell.col, '\n');

                    let intersectCells: Cell[] = this.getIntersectCells(xCell, yCell, pivotCell, grid)
                    intersectCells.forEach(intersected2Cell => {
                        this.removeValueFromPossibility(intersected2Cell.row, intersected2Cell.col, grid, commonElements[0])
                    })

                    console.log(`intersectCells`, intersectCells);
                }

            }
        }
        return null
    }
    getCommonCandidates(xCell: Cell, yCell: Cell): number[] {
        return xCell.possibilities.filter(candidate => yCell.possibilities.includes(candidate))
    }

    cellsAreIntersecting(xCell: Cell, yCell: Cell): boolean {
        return this.cellsAreInSameBox(xCell, yCell) ||
            this.cellsAreInSameRow(xCell, yCell) ||
            this.cellsAreInSameCol(xCell, yCell)
    }

    getIntersectCells(xCell: Cell, yCell: Cell, pivotCell: Cell, grid: Cell[][]): Cell[] {
        let intersectCells: Cell[] = []
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        for (let intersectedCell of emptyCells) {
            let isSameCell = intersectedCell === xCell || intersectedCell === yCell || intersectedCell === pivotCell

            if (!isSameCell && this.isIntersected3Cells(xCell, yCell, intersectedCell)) {
                intersectCells.push(intersectedCell)
            }
        }
        return intersectCells
    }

    isIntersected3Cells(cell1: Cell, cell2: Cell, intersectedCell: Cell): boolean {
        return this.isIntersected2Cells(cell1, intersectedCell) && this.isIntersected2Cells(cell2, intersectedCell)
    }

    isIntersected2Cells(cell1: Cell, cell2: Cell): boolean {
        let sameRow = cell1.row === cell2.row
        let sameCol = cell1.col === cell2.col
        let sameBox = this.cellsAreInSameBox(cell1, cell2)
        return sameRow || sameCol || sameBox
    }

    cellsAreInSameBox(cell1: Cell, cell2: Cell): boolean {
        return this.getBoxStartingPosition(cell1.row, cell1.col) === this.getBoxStartingPosition(cell2.row, cell2.col)
    }

    cellsAreInSameRow(cell1: Cell, cell2: Cell): boolean {
        return cell1.row === cell2.row
    }

    cellsAreInSameCol(cell1: Cell, cell2: Cell): boolean {
        return cell1.col === cell2.col
    }


    checkIfValidPivotCell(xCell: Cell, yCell: Cell, pivotCell: Cell, nonCommonCandidates: number[]) {
        // we know here that xCell & yCell are valid since they have only 2 candidates and are sharing only one candidate in between 
        let isSameCell = pivotCell === xCell || pivotCell === yCell
        let has2CandiatesOnly = pivotCell.possibilities.length === 2
        if (isSameCell || !has2CandiatesOnly) {
            return false
        }
        if (xCell.row === yCell.row && yCell.row === pivotCell.row
            || xCell.col === yCell.col && yCell.col === pivotCell.col) {
            return false
        }

        // non common candidates between xCell candidates and yCell candidates should be equal to the candidate of the pivot cell
        let isValidPivot = this.arraysEqual(nonCommonCandidates, pivotCell.possibilities)
        // if (xCell.col === 2 && xCell.row === 6 && yCell.col === 8 && yCell.row === 7) {
        //     // console.log('xCell', xCell, 'yCell', yCell, 'pivottt: ', pivotCell, nonCommonCandidates, tmp);

        // }
        return isValidPivot;


    }


    getPossiblePivotCells(xCell: Cell, yCell: Cell, grid: Cell[][]): Cell[] | null {
        let possiblePivotCells: Cell[] = []
        let emptyCells = this.getEmptyCells(grid)
        emptyCells.forEach(possiblePivotCell => {
            if (this.isIntersected3Cells(xCell, yCell, possiblePivotCell)) {
                possiblePivotCells.push(possiblePivotCell)
            }
        })
        // let areInSameBoxRow = this.cellsAreInSameBoxRow(xCell, yCell)
        // let areInSameBoxCol = xCell.col === yCell.col
        // if (areInSameBoxRow || areInSameBoxCol) {
        //     // possiblePivotCells = this.getEmptyCellsForBox(grid, xCell).concat(this.getEmptyCellsForBox(grid, yCell))

        // } else {
        //     let crossingCell1: Cell = grid[xCell.row][yCell.col]
        //     let crossingCell2: Cell = grid[yCell.row][xCell.col]
        //     possiblePivotCells = [crossingCell1, crossingCell2]
        // }
        return possiblePivotCells;
    }




    removePossibilitiesByXWings(grid: Cell[][]) {
        this.removePossibilitiesByXWingsForRows(grid);
        this.removePossibilitiesByXWingsForCols(grid);
    }

    removePossibilitiesByXWingsForRows(grid: Cell[][]) {
        let xWingCells: { candidate: number, xwingCells: Cell[] }[] = this.getColsXWingCells(grid)
        xWingCells.forEach(xWing => {
            const rows = [...new Set(xWing.xwingCells.map(xWing => xWing.row))]; // [ 'A', 'B']

            this.removeListOfPossibilitiesFromRowExcept(grid, rows[0], [xWing.candidate], xWing.xwingCells)
            this.removeListOfPossibilitiesFromRowExcept(grid, rows[1], [xWing.candidate], xWing.xwingCells)

        });
    }

    removePossibilitiesByXWingsForCols(grid: Cell[][]) {
        let xWingCells: { candidate: number, xwingCells: Cell[] }[] = this.getRowsXWingCells(grid)
        xWingCells.forEach(xWing => {
            const columns = [...new Set(xWing.xwingCells.map(xWing => xWing.col))]; // [ 'A', 'B']

            this.removeListOfPossibilitiesFromColExcept(grid, columns[0], [xWing.candidate], xWing.xwingCells)
            this.removeListOfPossibilitiesFromColExcept(grid, columns[1], [xWing.candidate], xWing.xwingCells)

        });
    }

    getRowsXWingCells(grid: Cell[][]): { candidate: number, xwingCells: Cell[] }[] {
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        let xWingCells: { candidate: number, xwingCells: Cell[] }[] = []
        emptyCells.forEach((cell) => {
            cell.possibilities.forEach(candidate => {
                if (!this.alreadyFound(xWingCells, candidate, cell)) {
                    let cellsHasExactly2CandidatesInRow = this.getCellsIfRowHasExactly2Candidates(candidate, cell.row, grid)
                    let xWingCellsForOneCandidate = this.getHorizontalSymmetricCells(cellsHasExactly2CandidatesInRow, candidate, grid)
                    if (xWingCellsForOneCandidate) {
                        xWingCells.push({ candidate: candidate, xwingCells: xWingCellsForOneCandidate })
                    }
                }
            })
        })
        return xWingCells
    }

    getColsXWingCells(grid: Cell[][]): { candidate: number, xwingCells: Cell[] }[] {
        let emptyCells: Cell[] = this.getEmptyCells(grid);
        let xWingCells: { candidate: number, xwingCells: Cell[] }[] = []
        emptyCells.forEach((cell) => {
            cell.possibilities.forEach(candidate => {
                if (!this.alreadyFound(xWingCells, candidate, cell)) {
                    let cellsHasExactly2CandidatesInCol = this.getCellsIfColHasExactly2Candidates(candidate, cell.row, grid)
                    let xWingCellsForOneCandidate = this.getVerticalSymmetricCells(cellsHasExactly2CandidatesInCol, candidate, grid)
                    if (xWingCellsForOneCandidate) {
                        xWingCells.push({ candidate: candidate, xwingCells: xWingCellsForOneCandidate })
                    }
                }
            })
        })
        return xWingCells
    }

    alreadyFound(xWingCells: { candidate: number; xwingCells: Cell[]; }[], candidate: number, cell: Cell): boolean {
        let found: boolean = false
        xWingCells.forEach(xWing => {
            if (xWing.candidate === candidate && xWing.xwingCells.includes(cell)) {
                found = true
            }

        });
        return found

    }

    getHorizontalSymmetricCells(cellsHasExactly2CandidatesInRow: Cell[] | null, candidate: number, grid: Cell[][]): Cell[] | null {
        if (!cellsHasExactly2CandidatesInRow) {
            return null
        }

        let xWingCells: Cell[] | null = null

        for (let row = 0; row <= 8; row++) {
            let cell1 = cellsHasExactly2CandidatesInRow[0]
            let cell2 = cellsHasExactly2CandidatesInRow[1]

            let xWingCell1 = grid[row][cell1.col]
            let xWingCell2 = grid[row][cell2.col]
            let areSameCells = cell1 === xWingCell1 || cell2 === xWingCell2
            if (areSameCells) {
                continue
            }

            let bothXWingsHasSameCandidates: boolean = xWingCell1.possibilities.includes(candidate) && xWingCell2.possibilities.includes(candidate)
            let bothXWingsHaveExactly2Candidates: boolean = !!this.getCellsIfRowHasExactly2Candidates(candidate, row, grid)

            if (bothXWingsHasSameCandidates && bothXWingsHaveExactly2Candidates) {
                xWingCells = [cell1, cell2, xWingCell1, xWingCell2]
            }


        }
        return xWingCells
    }

    getVerticalSymmetricCells(cellsHasExactly2CandidatesInCol: Cell[] | null, candidate: number, grid: Cell[][]): Cell[] | null {
        if (!cellsHasExactly2CandidatesInCol) {
            return null
        }

        let xWingCells: Cell[] | null = null

        for (let col = 0; col <= 8; col++) {
            let cell1 = cellsHasExactly2CandidatesInCol[0]
            let cell2 = cellsHasExactly2CandidatesInCol[1]

            let xWingCell1 = grid[cell1.row][col]
            let xWingCell2 = grid[cell2.row][col]
            let areSameCells = cell1 === xWingCell1 || cell2 === xWingCell2
            if (areSameCells) {
                continue
            }

            let bothXWingsHasSameCandidates: boolean = xWingCell1.possibilities.includes(candidate) && xWingCell2.possibilities.includes(candidate)
            let bothXWingsHaveExactly2Candidates: boolean = !!this.getCellsIfColHasExactly2Candidates(candidate, col, grid)

            if (bothXWingsHasSameCandidates && bothXWingsHaveExactly2Candidates) {
                xWingCells = [cell1, cell2, xWingCell1, xWingCell2]
            }


        }
        return xWingCells
    }


    getCellsIfRowHasExactly2Candidates(candidate: number, row: number, grid: Cell[][]): Cell[] | null {
        let twoCellsSharingSameCandidateInRow: Cell[] = []
        for (let col = 0; col <= 8; col++) {
            if (grid[row][col].possibilities.includes(candidate)) {
                twoCellsSharingSameCandidateInRow.push(grid[row][col]);
            }
        }
        return twoCellsSharingSameCandidateInRow.length === 2 ? twoCellsSharingSameCandidateInRow : null
    }

    getCellsIfColHasExactly2Candidates(candidate: number, col: number, grid: Cell[][]): Cell[] | null {
        let twoCellsSharingSameCandidateInCol: Cell[] = []
        for (let row = 0; row <= 8; row++) {
            if (grid[row][col].possibilities.includes(candidate)) {
                twoCellsSharingSameCandidateInCol.push(grid[row][col]);
            }
        }
        return twoCellsSharingSameCandidateInCol.length === 2 ? twoCellsSharingSameCandidateInCol : null
    }

    getCellsIfBoxHasExactly2Candidates(candidate: number, row: number, col: number, grid: Cell[][]): Cell[] | null {
        let twoCellsSharingSameCandidateInBox: Cell[] = []
        let startingPosition = this.getBoxStartingPosition(row, col);
        let startingRow = +this.getTens(startingPosition);
        let startingCol = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                if (grid[row][col].possibilities.includes(candidate)) {
                    twoCellsSharingSameCandidateInBox.push(grid[row][col]);
                }
            }
        }
        return twoCellsSharingSameCandidateInBox.length === 2 ? twoCellsSharingSameCandidateInBox : null
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
        // finalPuzzle is to determine the colors, if finalPuzzle is true, then color only cells

        let grid: Cell[][] = [];

        for (let row = 0; row <= 8; row++) {
            grid[row] = [];
            for (let col = 0; col <= 8; col++) {
                let index = row + '' + col
                let cellName = 'c' + index;
                let value = tableValues[cellName] ? +tableValues[cellName] : null
                let cell: Cell = { index: index, name: cellName, value: value, possibilities: [], row: row, col: col, puzzleNumber: true }
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

    cellsAreInSameBoxRow(cell1: Cell, cell2: Cell): boolean {
        return this.cellsAreInSameBoxDirection(cell1.row, cell2.row)
    }

    cellsAreInSameBoxCol(cell1: Cell, cell2: Cell): boolean {
        return this.cellsAreInSameBoxDirection(cell1.col, cell2.col)
    }

    cellsAreInSameBoxDirection(cell1Row: number, cell2Row: number): boolean {
        let startingPosition1 = Math.floor((cell1Row) / 3) * 3
        let startingPosition2 = Math.floor((cell2Row) / 3) * 3
        return startingPosition1 === startingPosition2
    }

    getBoxStartingPosition(cellRow: number, cellCol: number): string {
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

    getEmptyCellsForBox(grid: Cell[][], cell: Cell): Cell[] {
        let emptyCells: Cell[] = []
        let startingPosition = this.getBoxStartingPosition(cell.row, cell.col);

        let startingRow = +this.getTens(startingPosition);
        let startingCol = +this.getUnit(startingPosition);
        for (let row = startingRow; row <= startingRow + 2; row++) {
            for (let col = startingCol; col <= startingCol + 2; col++) {
                if (!grid[row][col].value) {
                    emptyCells.push(grid[row][col])
                }
            }
        }
        return emptyCells;
    }

    getTens(cellIndex: string): string {
        return Math.floor(+cellIndex / 10) + ''
    }

    getUnit(cellIndex: string): string {
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


    arraysEqual(array1: any[], array2: any[]) {
        if (array1 === array2) return true;
        if (array1 == null || array2 == null) return false;
        if (array1.length !== array2.length) return false;

        const sortedArray1 = array1.slice().sort();
        const sortedArray2 = array2.slice().sort();

        for (let i = 0; i < sortedArray1.length; i++) {
            if (sortedArray1[i] !== sortedArray2[i]) {
                return false; // Elements at index i are different, not equal
            }
        }
        return true;
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