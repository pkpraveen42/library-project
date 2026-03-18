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
  private apiUrl = '/api/books';
  private backendUrl = 'http://localhost:3008/api/books';

  constructor() {
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
    this.http.put(`${this.backendUrl}/${updatedBook.id}`, updatedBook).subscribe({
      next: (res) => {
        console.log('Updated in Excel:', res);
        this.loadInitialData(); // Refresh list to ensure UI matches Excel state
      },
      error: (err) => console.error('Failed to update in Excel:', err)
    });
  }

  deleteBook(id: string): void {
    // Sync with Excel backend - use direct URL for DELETE
    this.http.delete(`${this.backendUrl}/${id}`).subscribe({
      next: (res) => {
        console.log('Deleted from Excel:', res);
        this.loadInitialData(); // Refresh list after deletion
      },
      error: (err) => console.error('Failed to delete from Excel:', err)
    });
  }

  private loadInitialData(): void {
    // Fetch the latest data from the Excel file
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log(`BookService: Received ${data?.length || 0} books from Excel`);
        if (data && data.length > 0) {
          console.log('BookService: Sample data structure:', JSON.stringify(data[0]));
        }
        this.books = data || [];
        this.booksSubject.next(this.books);
      },
      error: (err) => {
        console.error('Failed to load from Excel:', err);
        console.error('Error details:', err.message || JSON.stringify(err));
        this.booksSubject.next([]); 
      }
    });
  }


}
