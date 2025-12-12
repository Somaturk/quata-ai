import Dexie, { Table } from 'dexie';
import type { Product, Company, Offer } from '@/lib/types';

export class OneQuataDB extends Dexie {
    products!: Table<Product, string>;
    companies!: Table<Company, string>;
    offers!: Table<Offer, string>;

    constructor() {
        super('onequata-db');
        this.version(1).stores({
            products: 'id, name, category, supplier, brand',
            companies: 'id, name, type',
            offers: 'id, offerNumber, offerDate, customerName, isOrder',
        });
    }
}

export const db = new OneQuataDB();
