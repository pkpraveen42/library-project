import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from './book.service';
import { Book } from './book.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private bookService = inject(BookService);
  private cdr = inject(ChangeDetectorRef);

  books: Book[] = [];
  filteredBooks: Book[] = [];
  pagedBooks: Book[] = [];

  // Form fields
  currentBookId: string | null = null;
  currentSNo: string = '';  // Disabled S.No display
  currentBookIndex: number = -1; // Track the index of selected book
  selectedBook: Book | null = null;
  isEditMode: boolean = false;

  title: string = '';
  author: string = '';
  isbn: string = '';
  purchaseDate: string = '';
  price: number = 0;
  quantity: number = 1;
  supply: string = 'Govt supply';
  rack: string = 'GF-Rack-A';
  accessionNum: string = '';
  publisher: string = '';

  // Dropdown options
  supplyOptions = ['Govt supply', 'Private'];
  rackOptions = ['GF-Rack-A', 'GF-RACK-B', 'GF-RACK-C'];

  // Design purpose dropdowns
  stateOptions = ['TamilNadu (TN)'];
  districtOptions = ['Coimbatore (CBE)'];
  libraryPlaceOptions = ['Ganapathy (G)'];

  selectedState = 'TamilNadu (TN)';
  selectedDistrict = 'Coimbatore (CBE)';
  selectedLibraryPlace = 'Ganapathy (G)';
  excelPath = '';

  // Per-column search
  colSearch = {
    title: '',
    author: '',
    purchaseDate: '',
    price: '',
    quantity: '',
    supply: '',
    rack: '',
    accessionNum: '',
    publisher: '',
    sNo: ''
  };

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pageNumbers: number[] = [];

  ngOnInit() {
    console.log('App: Component initialized, subscribing to BookService');

    // Load initial excel path from server
    this.bookService.getExcelPath().subscribe({
      next: (config) => {
        if (config && config.path) {
          this.excelPath = config.path;
        }
      },
      error: (err) => console.error('App: Failed to load excel path config:', err)
    });

    this.bookService.getBooks().subscribe({
      next: (data) => {
        console.log(`App: Subscription received ${data?.length || 0} books`);
        if (data && data.length > 0) {
          console.log('App: First book received:', JSON.stringify(data[0]));
        }
        this.books = [...(data || [])];

        // Ensure Angular's change detection picks this up after the next tick
        setTimeout(() => {
          console.log('App: Applying filters after data reception');
          this.applyFilters();
          this.cdr.detectChanges();
        }, 10);
      },
      error: (err) => {
        console.error('App: Failed to subscribe to books subject:', err);
      }
    });
  }

  updateExcelPath() {
    if (!this.excelPath) return;
    this.bookService.updateExcelPath(this.excelPath).subscribe({
      next: (res) => {
        alert('Excel path updated successfully!');
        this.manualRefresh();
      },
      error: (err) => alert('Failed to update Excel path: ' + (err.error?.error || err.message))
    });
  }

  manualRefresh() {
    console.log('App: Manual refresh requested for path:', this.excelPath);
    if (this.excelPath) {
      // Sync path to server, then refresh
      this.bookService.updateExcelPath(this.excelPath).subscribe({
        next: () => {
          console.log('App: Path synced for refresh');
          this.bookService.refreshData();
        },
        error: (err) => {
          console.error('App: Failed to sync path before refresh:', err);
          this.bookService.refreshData(); // Try refresh anyway
        }
      });
    } else {
      this.bookService.refreshData();
    }
  }

  // ── Selection ────────────────────────────────
  selectBook(book: Book) {
    console.log('App: Selecting book:', book);
    this.selectedBook = book;
    this.currentBookId = book.id;
    this.isEditMode = true; // Auto-enable edit mode on selection for easier editing

    // Find the global index (S.No) in filteredBooks
    const idx = this.filteredBooks.findIndex(b => b.id === book.id);
    this.currentSNo = idx >= 0 ? String(idx + 1) : '';
    this.currentBookIndex = idx; // Store the index for S.No display

    this.title = book.title || '';
    this.author = book.author || '';
    this.isbn = book.isbn || '';
    this.purchaseDate = book.purchaseDate || '';
    this.price = Number(book.price) || 0;
    this.quantity = Number(book.quantity) || 1;
    this.supply = book.supply || 'Govt supply';
    this.rack = book.rack || 'GF-Rack-A';
    this.accessionNum = book.accessionNum || '';
    this.publisher = book.publisher || '';
  }

  // ── Helper Functions ───────────────────────────────
  normalizeString(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '').trim();
  }

  // ── Get Next Serial Number ───────────────────────
  getNextSerialNumber(): number {
    if (this.books.length === 0) {
      return 1;
    }

    // S.No is based on array index + 1, so next S.No is length + 1
    return this.books.length + 1;
  }

  // ── Generate Accession Number ───────────────────────
  generateAccessionNumber(): string {
    const districtCode = 'CBE';
    const libraryCode = 'G';
    const sNo = this.getNextSerialNumber();
    return `${districtCode}${libraryCode}${sNo}`;
  }

  checkDuplicate(title: string, author: string, isbn: string, purchaseDate: string, price: number, quantity: number, supply: string, rack: string, accessionNum: string, publisher: string, excludeId?: string): { isDuplicate: boolean; sNo?: number } {
    const normalizedTitle = this.normalizeString(title);
    const normalizedAuthor = this.normalizeString(author);
    const normalizedISBN = this.normalizeString(isbn);
    const normalizedPurchaseDate = this.normalizeString(purchaseDate);
    const normalizedSupply = this.normalizeString(supply);
    const normalizedRack = this.normalizeString(rack);
    const normalizedAccessionNum = this.normalizeString(accessionNum);
    const normalizedPublisher = this.normalizeString(publisher);

    for (let i = 0; i < this.books.length; i++) {
      const book = this.books[i];
      if (excludeId && book.id === excludeId) continue; // Skip current book when updating

      if (this.normalizeString(book.title) === normalizedTitle &&
        this.normalizeString(book.author) === normalizedAuthor &&
        this.normalizeString(book.isbn) === normalizedISBN &&
        this.normalizeString(book.purchaseDate) === normalizedPurchaseDate &&
        book.price === price &&
        book.quantity === quantity &&
        this.normalizeString(book.supply) === normalizedSupply &&
        this.normalizeString(book.rack) === normalizedRack &&
        this.normalizeString(book.accessionNum) === normalizedAccessionNum &&
        this.normalizeString(book.publisher) === normalizedPublisher) {
        return { isDuplicate: true, sNo: i + 1 }; // Return S.No (index + 1)
      }
    }

    return { isDuplicate: false };
  }

  // ── Edit Mode ────────────────────────────────
  editMode() {
    if (!this.currentBookId) return;
    this.isEditMode = true;
  }

  // ── Add ──────────────────────────────────────
  addBook() {
    if (!this.title || !this.author || !this.isbn || !this.purchaseDate || this.price <= 0 || this.quantity <= 0 || !this.supply || !this.rack || !this.publisher) {
      alert('Please fill all fields correctly.');
      return;
    }

    // Check for duplicates
    const duplicate = this.checkDuplicate(this.title, this.author, this.isbn, this.purchaseDate, this.price, this.quantity, this.supply, this.rack, this.generateAccessionNumber(), this.publisher);
    if (duplicate.isDuplicate) {
      alert(`This data already exists S.No ${duplicate.sNo}`);
      return;
    }

    const newBook: Book = {
      id: Date.now().toString(),
      title: this.title,
      author: this.author,
      isbn: this.isbn,
      purchaseDate: this.purchaseDate,
      price: this.price,
      quantity: this.quantity,
      supply: this.supply,
      rack: this.rack,
      accessionNum: this.generateAccessionNumber(),
      publisher: this.publisher
    };

    this.bookService.addBook(newBook);
    // Refresh books data
    this.bookService.getBooks().subscribe(data => {
      this.books = data;
      this.applyFilters();
    });
    this.resetForm();
    alert('Book added successfully!');
  }

  // ── Update ───────────────────────────────────
  updateBook() {
    if (!this.currentBookId || !this.isEditMode) return;
    if (!this.title || !this.author || !this.isbn || !this.purchaseDate || this.price <= 0 || this.quantity <= 0 || !this.supply || !this.rack || !this.publisher) {
      alert('Please fill all fields correctly.');
      return;
    }

    // Check for duplicate (exclude current book)
    const duplicateCheck = this.checkDuplicate(this.title, this.author, this.isbn, this.purchaseDate, this.price, this.quantity, this.supply, this.rack, this.generateAccessionNumber(), this.publisher, this.currentBookId);
    if (duplicateCheck.isDuplicate) {
      alert(`This data already exists S.No ${duplicateCheck.sNo}`);
      return;
    }
    const updatedBook: Book = {
      id: this.currentBookId,
      title: this.title,
      author: this.author,
      isbn: this.isbn,
      purchaseDate: this.purchaseDate,
      price: Math.round(this.price),
      quantity: this.quantity,
      supply: this.supply,
      rack: this.rack,
      accessionNum: this.generateAccessionNumber(),
      publisher: this.publisher
    };

    this.bookService.updateBook(updatedBook);
    // Refresh books data
    this.bookService.getBooks().subscribe(data => {
      this.books = data;
      this.applyFilters();
    });
    alert('Book updated successfully in Excel!');
    this.resetForm();
  }

  // ── Delete ───────────────────────────────────
  deleteSelectedBook() {
    if (!this.currentBookId) return;
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(this.currentBookId);
      this.resetForm();
    }
  }

  // ── Reset ────────────────────────────────────
  resetForm() {
    console.log('App: Resetting form');
    this.currentBookId = '';
    this.currentBookIndex = -1;
    this.isEditMode = false;
    this.title = '';
    this.author = '';
    this.isbn = '';
    this.purchaseDate = '';
    this.price = 0;
    this.quantity = 1;
    this.supply = 'Govt supply';
    this.rack = 'GF-Rack-A';
    this.accessionNum = '';
    this.publisher = '';
    this.cdr.detectChanges();
  }

  // ── Filter ───────────────────────────────────
  applyFilters() {
    console.log('App: Starting filter process. Total records:', this.books.length);

    if (!this.books || this.books.length === 0) {
      console.warn('App: No books available to filter.');
      this.filteredBooks = [];
      this.currentPage = 1;
      this.buildPagination();
      this.cdr.detectChanges();
      return;
    }

    this.filteredBooks = this.books.filter((book, index) => {
      // Helper to match column search, handles null/undefined
      const match = (val: any, search: string) => {
        if (!search) return true;
        const normalizedVal = (val || '').toString().toLowerCase();
        return normalizedVal.includes(search.toLowerCase());
      };

      const matchTitle = match(book.title, this.colSearch.title);
      const matchAuthor = match(book.author, this.colSearch.author);
      const matchDate = match(book.purchaseDate, this.colSearch.purchaseDate);
      const matchPrice = match(book.price, this.colSearch.price);
      const matchQty = match(book.quantity, this.colSearch.quantity);
      const matchSupply = match(book.supply, this.colSearch.supply);
      const matchRack = match(book.rack, this.colSearch.rack);
      const matchAccession = match(book.accessionNum, this.colSearch.accessionNum);
      const matchPublisher = match(book.publisher, this.colSearch.publisher);

      // S.No search (against index + 1)
      const sNo = (index + 1).toString();
      const matchSNo = !this.colSearch.sNo || sNo.includes(this.colSearch.sNo);

      return matchTitle && matchAuthor && matchDate && matchPrice && matchQty &&
        matchSupply && matchRack && matchAccession && matchPublisher && matchSNo;
    });

    console.log(`App: Filter completed. Matches found: ${this.filteredBooks.length}`);
    this.currentPage = 1;
    this.buildPagination();
    this.cdr.detectChanges();
  }

  // ── Pagination ───────────────────────────────
  buildPagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredBooks.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.updatePagedBooks();
    this.buildPageNumbers();
  }

  updatePagedBooks() {
    this.pageSize = Number(this.pageSize) || 10;
    this.currentPage = Number(this.currentPage) || 1;

    console.log(`App: Updating paged books. Page: ${this.currentPage}, Size: ${this.pageSize}`);
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedBooks = this.filteredBooks.slice(start, start + this.pageSize);

    console.log('App: Current pagedBooks content:', JSON.stringify(this.pagedBooks));
    this.cdr.detectChanges(); // Force UI update
  }

  buildPageNumbers() {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    this.pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedBooks();
    this.buildPageNumbers();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.buildPagination();
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // ── Export to XLSX ───────────────────────────
  exportToExcel() {
    const data = this.filteredBooks.map((b, i) => ({
      'S.No': i + 1,
      'Book Title': b.title,
      'Author': b.author,
      'ISBN': b.isbn,
      'Purchase Date': b.purchaseDate,
      'Price': b.price,
      'Qty': b.quantity,
      'Supply': b.supply,
      'Rack': b.rack,
      'Accession Number': b.accessionNum,
      'Publisher': b.publisher
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
      { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PurchaseRecords');

    // Write as binary array and use Blob with explicit xlsx MIME type
    const wbArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    // Dynamic filename: LibraryPurchase_DD-MM-YYYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const fileName = `LibraryPurchase_${day}-${month}-${year}.xlsx`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
