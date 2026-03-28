import { Component, inject, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from './book.service';
import { Book } from './book.model';
import * as XLSX from 'xlsx';

// Extend Window interface for Electron detection
declare global {
  interface Window {
    process?: any;
    electron?: any;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit {
  private bookService = inject(BookService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('titleInput', { static: false }) titleInput!: ElementRef<HTMLInputElement>;

  // Detect if running in Electron environment
  private isElectron: boolean = false;

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
    // Detect if running in Electron environment
    this.isElectron = this.checkElectronEnvironment();
    console.log('App: Running in Electron:', this.isElectron);

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
    if (!this.excelPath) {
      alert('Please enter an Excel file path');
      // Focus the Book Title field after validation error
      setTimeout(() => {
        this.focusBookTitleField();
      }, 100);
      return;
    }
    
    // Show loading message
    const loadingMessage = 'Updating Excel path...';
    console.log(loadingMessage);
    
    this.bookService.updateExcelPath(this.excelPath).subscribe({
      next: (res) => {
        console.log('Path update response:', res);
        alert('Excel path updated successfully!\n\nIf the grid shows no data, please ensure:\n1. The Excel file exists at the specified path\n2. The Excel file contains data with proper headers\n3. The file is not open in another program');
        
        // Focus the Book Title field after successful path update
        setTimeout(() => {
          this.focusBookTitleField();
        }, 100);
        
        // Add small delay to ensure server processes the path update
        setTimeout(() => {
          this.manualRefresh();
        }, 500);
      },
      error: (err) => {
        console.error('Path update error:', err);
        alert('Failed to update Excel path: ' + (err.error?.error || err.message) + 
              '\n\nPlease check:\n1. The file path is correct\n2. The file exists\n3. You have permission to access the file');
        
        // Focus the Book Title field after error
        setTimeout(() => {
          this.focusBookTitleField();
        }, 100);
      }
    });
  }

  manualRefresh() {
    console.log('App: Manual refresh requested for path:', this.excelPath);
    // Just refresh data - path was already set in updateExcelPath()
    this.bookService.refreshData();
    
    // Focus the Book Title field after refresh
    setTimeout(() => {
      this.focusBookTitleField();
    }, 100);
  }

  ngAfterViewInit() {
    // Focus the Book Title field after the component has initialized
    setTimeout(() => {
      this.focusBookTitleField();
    }, 100);
  }

  // ── Helper Methods ───────────────────────────────
  checkElectronEnvironment(): boolean {
    // Check if running in Electron
    return !!(window && window.process && window.process.type) ||
           !!(window.electron) ||
           navigator.userAgent.toLowerCase().indexOf('electron') > -1;
  }

  // ── Focus Methods ───────────────────────────────
  focusBookTitleField() {
    console.log('App: Attempting to focus Book Title field');
    console.log('App: Running in Electron:', this.isElectron);
    
    // For Electron, use a simpler approach to avoid field locking
    if (this.isElectron) {
      this.focusBookTitleElectron();
    } else {
      this.focusBookTitleBrowser();
    }
  }

  focusBookTitleElectron() {
    console.log('App: Using Electron focus method');
    
    // For Electron, use a much gentler approach to prevent field locking
    setTimeout(() => {
      if (this.titleInput && this.titleInput.nativeElement) {
        try {
          const element = this.titleInput.nativeElement;
          
          // Check if field is enabled and not readonly
          if (!element.disabled && !element.readOnly) {
            console.log('App: Electron - Field is enabled, attempting gentle focus');
            
            // Release any existing focus first to prevent locking
            if (document.activeElement && document.activeElement !== element) {
              (document.activeElement as HTMLElement).blur();
            }
            
            // Very gentle focus approach with minimal intervention
            setTimeout(() => {
              try {
                element.focus();
                
                // Only attempt selection if focus was successful and doesn't interfere
                setTimeout(() => {
                  if (document.activeElement === element && element.value) {
                    try {
                      element.select();
                      console.log('App: Electron - Focus and selection successful');
                    } catch (selectError) {
                      console.log('App: Electron - Selection failed, but focus works');
                    }
                  } else {
                    console.log('App: Electron - Focus successful, selection skipped');
                  }
                }, 100);
              } catch (focusError) {
                console.warn('App: Electron - Focus failed, field might be locked');
                // Try to release any potential modal state
                this.releaseModalState();
              }
            }, 50); // Very short delay
          } else {
            console.warn('App: Electron - Field is disabled or readonly, skipping focus');
          }
        } catch (error) {
          console.error('App: Electron - Focus error:', error);
          this.releaseModalState();
        }
      } else {
        console.warn('App: Electron - Title input element not available');
      }
    }, 300); // Longer initial delay to prevent interference
  }

  releaseModalState() {
    // Helper method to release any modal-like state in Electron
    try {
      // Blur any active elements
      if (document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
      
      // Clear any selections
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
      
      // Reset focus to body to release modal state
      setTimeout(() => {
        if (document.body) {
          document.body.focus();
        }
        
        // Then try to focus the title field again
        setTimeout(() => {
          if (this.titleInput && this.titleInput.nativeElement) {
            this.titleInput.nativeElement.focus();
          }
        }, 50);
      }, 50);
    } catch (error) {
      console.warn('App: Electron - Error releasing modal state:', error);
    }
  }

  handleGlobalClick(event: MouseEvent) {
    // Handle global clicks to prevent modal-like behavior in Electron
    if (this.isElectron) {
      // Small delay to allow the click event to complete
      setTimeout(() => {
        // Check if we need to release any modal state
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
          // If an input is focused, ensure it's not in a locked state
          const input = activeElement as HTMLInputElement;
          if (input.disabled || input.readOnly) {
            console.log('App: Electron - Detected locked input, releasing modal state');
            this.releaseModalState();
          }
        }
      }, 10);
    }
  }

  focusBookTitleBrowser() {
    console.log('App: Using browser focus method');
    
    const attemptFocus = (attempt: number) => {
      console.log(`App: Browser focus attempt #${attempt}`);
      
      if (this.titleInput && this.titleInput.nativeElement) {
        console.log('App: Browser - Found titleInput element, focusing...');
        
        try {
          const element = this.titleInput.nativeElement;
          
          // Check if field is enabled
          if (!element.disabled && !element.readOnly) {
            element.focus();
            element.select();
            
            // Verify focus was successful
            setTimeout(() => {
              if (document.activeElement === this.titleInput.nativeElement) {
                console.log('App: Browser - Focus successful - Book Title field is now active');
              } else {
                console.warn('App: Browser - Focus may not have worked, retrying...');
                if (attempt < 3) {
                  setTimeout(() => attemptFocus(attempt + 1), 100);
                } else {
                  console.error('App: Browser - Failed to focus Book Title field after 3 attempts');
                }
              }
            }, 50);
          } else {
            console.warn('App: Browser - Field is disabled or readonly');
          }
          
        } catch (error) {
          console.error('App: Browser - Error during focus:', error);
          if (attempt < 3) {
            setTimeout(() => attemptFocus(attempt + 1), 100);
          }
        }
      } else {
        console.warn(`App: Browser - titleInput reference not available on attempt ${attempt}, retrying...`);
        if (attempt < 3) {
          setTimeout(() => attemptFocus(attempt + 1), 100);
        } else {
          console.error('App: Browser - Could not focus title field - element not found after 3 attempts');
        }
      }
    };
    
    // Start first attempt
    attemptFocus(1);
  }

  // ── Selection ────────────────────────────────
  selectBook(book: Book) {
    console.log('App: Selecting book:', book);
    console.log('App: Before selection - isEditMode:', this.isEditMode);
    
    this.selectedBook = book;
    this.currentBookId = book.id;
    this.isEditMode = true; // Auto-enable edit mode on selection for easier editing
    
    console.log('App: After selection - isEditMode:', this.isEditMode);
    console.log('App: Book data loaded - title:', this.title, 'author:', this.author);

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
    
    // Force change detection and wait for DOM to update
    this.cdr.detectChanges();
    console.log('App: After change detection - title:', this.title);
    
    // Focus the Book Title field after selecting a book
    // Use longer delay for Electron to prevent field locking
    const focusDelay = this.isElectron ? 400 : 300;
    setTimeout(() => {
      this.focusBookTitleField();
    }, focusDelay);
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
    if (!this.title || !this.author || !this.publisher || !this.purchaseDate || this.quantity <= 0 || !this.supply) {
      alert('Please fill all fields correctly.');
      // Focus the Book Title field after validation error
      setTimeout(() => {
        this.focusBookTitleField();
      }, 100);
      return;
    }

    // Check for duplicates
    const duplicate = this.checkDuplicate(this.title, this.author, this.isbn, this.purchaseDate, this.price, this.quantity, this.supply, this.rack, this.generateAccessionNumber(), this.publisher);
    if (duplicate.isDuplicate) {
      alert(`This data already exists S.No ${duplicate.sNo}`);
      // Focus the Book Title field after duplicate error
      setTimeout(() => {
        this.focusBookTitleField();
      }, 100);
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
    
    // Focus the Book Title field for the next entry
    setTimeout(() => {
      this.focusBookTitleField();
    }, 100);
  }

  // ── Update ───────────────────────────────────
  updateBook() {
    if (!this.currentBookId || !this.isEditMode) return;
    if (!this.title || !this.author || !this.publisher || !this.purchaseDate || this.quantity <= 0 || !this.supply) {
      alert('Please fill all fields correctly.');
      // Focus the Book Title field after validation error
      setTimeout(() => {
        this.focusBookTitleField();
      }, 100);
      return;
    }

    // Check for duplicate (exclude current book)
    const duplicateCheck = this.checkDuplicate(this.title, this.author, this.isbn, this.purchaseDate, this.price, this.quantity, this.supply, this.rack, this.generateAccessionNumber(), this.publisher, this.currentBookId);
    if (duplicateCheck.isDuplicate) {
      alert(`This data already exists S.No ${duplicateCheck.sNo}`);
      // Focus the Book Title field after duplicate error
      setTimeout(() => {
        this.focusBookTitleField();
      }, 100);
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
    
    // Focus the Book Title field for the next entry
    setTimeout(() => {
      this.focusBookTitleField();
    }, 100);
  }

  // ── Delete ───────────────────────────────────
  deleteSelectedBook() {
    if (!this.currentBookId) return;
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(this.currentBookId);
      this.resetForm();
      
      // Focus the Book Title field after deletion
      setTimeout(() => {
        this.focusBookTitleField();
      }, 100);
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
    
    // Focus the Book Title field after reset
    setTimeout(() => {
      this.focusBookTitleField();
    }, 50);
  }

  // ── Filter ───────────────────────────────────
  applyFilters() {
    console.log('=== FILTER DEBUG START ===');
    console.log('App: Starting filter process. Total records:', this.books.length);
    console.log('App: Current search filters:', this.colSearch);

    if (!this.books || this.books.length === 0) {
      console.warn('App: No books available to filter.');
      this.filteredBooks = [];
      this.currentPage = 1;
      this.buildPagination();
      this.cdr.detectChanges();
      return;
    }

    let filteredCount = 0;
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

      // S.No search (against the book's position in the full books array)
      const sNo = (this.books.indexOf(book) + 1).toString();
      const matchSNo = !this.colSearch.sNo || sNo === this.colSearch.sNo;

      const isMatch = matchTitle && matchAuthor && matchDate && matchPrice && matchQty &&
        matchSupply && matchRack && matchAccession && matchPublisher && matchSNo;
      
      if (isMatch) {
        filteredCount++;
        if (filteredCount <= 3 || filteredCount >= this.books.length - 2) {
          console.log(`App: Filtered book #${filteredCount}:`, book.title, 'ID:', book.id);
        }
      }
      
      return isMatch;
    });

    console.log('App: Filter completed. Matches found:', this.filteredBooks.length);
    console.log('=== FILTER DEBUG END ===');
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
    console.log('=== EXPORT DEBUG START ===');
    console.log('Export: Total books in system:', this.books.length);
    console.log('Export: Filtered books count:', this.filteredBooks.length);
    console.log('Export: Paged books count:', this.pagedBooks.length);
    console.log('Export: Current page:', this.currentPage);
    console.log('Export: Page size:', this.pageSize);
    
    // Use all books for export, not filtered books, unless filters are actively applied
    const booksToExport = this.filteredBooks.length < this.books.length ? this.filteredBooks : this.books;
    console.log('Export: Books to export count:', booksToExport.length);
    
    // Log first and last few books to verify data
    if (booksToExport.length > 0) {
      console.log('Export: First book:', booksToExport[0]);
      console.log('Export: Last book:', booksToExport[booksToExport.length - 1]);
      console.log('Export: Last book ID:', booksToExport[booksToExport.length - 1]?.id);
    }
    
    // Find the actual S.No for each book from the original books array
    const data = booksToExport.map((book) => {
      const actualIndex = this.books.findIndex(b => b.id === book.id);
      const actualSNo = actualIndex >= 0 ? actualIndex + 1 : 0;
      
      return {
        'S.No': actualSNo,
        'Book Title': book.title,
        'Author': book.author,
        'ISBN': book.isbn,
        'Purchase Date': book.purchaseDate,
        'Price': book.price,
        'Qty': book.quantity,
        'Supply': book.supply,
        'Rack': book.rack,
        'Accession Number': book.accessionNum,
        'Publisher': book.publisher
      };
    });

    console.log('Export: Data array length (before total row):', data.length);
    
    // Log the last few entries in the data array
    if (data.length > 0) {
      console.log('Export: Last data entry S.No:', data[data.length - 1]['S.No']);
      console.log('Export: Last data entry title:', data[data.length - 1]['Book Title']);
    }

    // Add total row at the end
    if (data.length > 0) {
      data.push({
        'S.No': 0,
        'Book Title': 'Total',
        'Author': '',
        'ISBN': '',
        'Purchase Date': '',
        'Price': 0,
        'Qty': this.getTotalQuantity(),
        'Supply': '',
        'Rack': '',
        'Accession Number': '',
        'Publisher': ''
      });
    }

    console.log('Export: Data array length (after total row):', data.length);
    console.log('Export: Total quantity calculated:', this.getTotalQuantity());
    console.log('=== EXPORT DEBUG END ===');

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
      { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
    ];

    // Style the total row
    if (data.length > 0) {
      const totalRow = data.length + 2;
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      console.log('totalRow', totalRow, 'range', range);
      
      // Add "Totals" label in the first column of the total row
      const labelCell = XLSX.utils.encode_cell({ r: totalRow, c: 0 });
      ws[labelCell] = { 
        t: 's', 
        v: 'Totals',
        s: {
          font: { bold: true },
          fill: { patternType: 'solid', fgColor: { rgb: "E3F2FD" } },
          alignment: { horizontal: 'left' }
        }
      };
      
      // Style the total quantity cell
      const qtyCell = XLSX.utils.encode_cell({ r: totalRow, c: 6 }); // Qty column (0-indexed: 6)
      ws[qtyCell] = {
        t: 'n',
        v: this.getTotalQuantity(),
        s: {
          font: { bold: true },
          fill: { patternType: 'solid', fgColor: { rgb: "E3F2FD" } },
          alignment: { horizontal: 'center' }
        }
      };

      console.log('labelCell', labelCell, 'qtyCell', qtyCell);
      
      // Clear other cells in total row to avoid unwanted data
      for (let col = 1; col <= 10; col++) {
        if (col !== 6) { // Skip Qty column
          const cell = XLSX.utils.encode_cell({ r: totalRow, c: col });
          ws[cell] = { t: 's', v: '' };
        }
      }
    }

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
    
    // Focus the Book Title field after export
    setTimeout(() => {
      this.focusBookTitleField();
    }, 100);
  }

  // ── Get Total Quantity ───────────────────────
  getTotalQuantity(): number {
    if (!this.filteredBooks || this.filteredBooks.length === 0) {
      return 0;
    }
    return this.filteredBooks.reduce((total, book) => total + (Number(book.quantity) || 0), 0);
  }
}
