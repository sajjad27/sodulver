import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class RecognizerService {


    constructor(private http: HttpClient) { }



    recognize(file: any) {

        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<any>('http://127.0.0.1:5000/recognize-sudoku/upload', formData)

    }


}