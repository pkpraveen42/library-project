export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  purchaseDate: string;
  price: number;
  quantity: number;
  supply: string;        // New: Govt supply, Private
  rack: string;          // New: GF-Rack-A, GF-RACK-B, GF-RACK-C
  accessionNum: string;  // New: Accession Number
  publisher: string;     // New: Publisher
}
