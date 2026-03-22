import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Book } from './book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private books: Book[] = [];
  private booksSubject = new BehaviorSubject<Book[]>([]);

  private http = inject(HttpClient);
  // Use localhost:3008 for both Angular dev server and Electron (file protocol)
  private apiUrl = (window.location.origin.includes('localhost:4200') || window.location.protocol === 'file:') 
    ? 'http://localhost:3008/api/books' 
    : '/api/books';

  constructor() {
    this.refreshData();
  }

  getExcelPath(): Observable<{ path: string }> {
    const url = this.apiUrl.replace('/books', '/config/path');
    return this.http.get<{ path: string }>(url);
  }

  updateExcelPath(newPath: string): Observable<any> {
    console.log('BookService: Updating Excel path:', newPath);
    const url = this.apiUrl.replace('/books', '/config/path');
    return this.http.post(url, { path: newPath });
  }

  refreshData(): void {
    this.loadInitialData();
  }

  getBooks(): Observable<Book[]> {
    return this.booksSubject.asObservable();
  }

  addBook(book: Book): void {
    book.id = Date.now().toString();

    // Sync with Excel backend
    this.http.post(this.apiUrl, book).subscribe({
      next: (res) => {
        console.log('Stored in Excel:', res);
        this.loadInitialData(); // Refresh list to show new book and correct S.No
      },
      error: (err) => console.error('Failed to store in Excel:', err)
    });
  }

  updateBook(updatedBook: Book): void {
    // Sync with Excel backend - use direct URL for PUT
    this.http.put(`${this.apiUrl}/${updatedBook.id}`, updatedBook).subscribe({
      next: (res) => {
        console.log('Updated in Excel:', res);
        this.loadInitialData(); // Refresh list to ensure UI matches Excel state
      },
      error: (err) => console.error('Failed to update in Excel:', err)
    });
  }

  deleteBook(id: string): void {
    // Sync with Excel backend - use direct URL for DELETE
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: (res) => {
        console.log('Deleted from Excel:', res);
        this.loadInitialData(); // Refresh list after deletion
      },
      error: (err) => console.error('Failed to delete from Excel:', err)
    });
  }

  private loadInitialData(): void {
    console.log(`BookService: Fetching data from: ${this.apiUrl}`);
    // Fetch the latest data from the Excel file
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log(`BookService: Received ${data?.length || 0} books from server`);
        if (data && data.length > 0) {
          console.log('BookService: First record:', JSON.stringify(data[0]));
        } else {
          console.warn('BookService: Server returned empty book list.');
        }
        this.books = data || [];
        this.booksSubject.next(this.books);
      },
      error: (err) => {
        console.error('BookService Error fetching from server:', err);
        console.error('API URL used:', this.apiUrl);
        if (err.status === 0) {
          console.error('Could not reach backend. Is the server running on port 3008?');
        }
        this.booksSubject.next([]);
      }
    });
  }


}
