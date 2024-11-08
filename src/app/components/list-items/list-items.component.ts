import { Component, EventEmitter, OnInit, Input, ViewChild, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../card-list/card-list.component';
import { AddItemsComponent } from '../add-items/add-items.component';
import { BuyItemComponent } from '../buy-item/buy-item.component';

interface Item {
  name: string;
  price: number;
  quantity: number;
  category: string;
}


@Component({
  selector: 'app-list-items',
  standalone: true,
  imports: [CommonModule, CardListComponent, AddItemsComponent, BuyItemComponent],
  templateUrl: './list-items.component.html',
  styleUrl: './list-items.component.scss'
})
export class ListItemsComponent implements OnInit {
  items: Array<Item> = []


  itemsByCategory = {
    perishables: [] as Item[],
    cold: [] as Item[],
    cleaning: [] as Item[],
    others: [] as Item[],
  };


  totalPrice: number = 0

  // @Input() loadBuyItems = new EventEmitter<void>()
  @Output() notifyAddItem = new EventEmitter<void>()
  @Output() notifyUpdatedItem = new EventEmitter<void>()
  @Output() notifyRemoveItem = new EventEmitter<void>()
  @Output() notifyByuItem = new EventEmitter<void>()




  @ViewChild(AddItemsComponent) addItemsComponent!: AddItemsComponent;
  @ViewChild(BuyItemComponent) buyItemComponent!: BuyItemComponent;
  
  metod(): void {
    
  }

  ngOnInit(): void {
    this.loadItems()
    // this.clearListBuy()
    // this.clearList()
  }

  ngAfterViewInit(): void {
    this.addItemsComponent.itemUpdated.subscribe(() => {
      this.loadItems();
    });
  }

  loadItems(): void {
    const storedItems = localStorage.getItem('itensCategory')
    if (storedItems) {
      this.itemsByCategory = JSON.parse(storedItems);
      this.calculateTotalPrice();
    }
  }

  calculateTotalPrice(): void {
    this.totalPrice = Object.values(this.itemsByCategory)
      .flat()
      .reduce((acc, item) => acc + item.price * item.quantity, 0)

  }

  editItem(item: Item, index: number, category: string): void {
    const typedCategory = category as keyof typeof this.itemsByCategory;
    if (this.addItemsComponent) {
      this.addItemsComponent.startEdit(item, typedCategory, index);
      this.scrollToTop();
    } else {
      console.log('addItemsComponent não está inicializado');
    }
  }

  deleteItem(category: string, index: number): void {
    const typedCategory = category as keyof typeof this.itemsByCategory;
    this.itemsByCategory[typedCategory].splice(index, 1);
    this.saveItems();
    this.loadItems();
    this.notifyRemoveItem.emit();
  }

  buyItem(item: Item, category: string, index: number): void {
    const typedCategory = category as keyof typeof this.itemsByCategory;
    const purchasedItems = JSON.parse(localStorage.getItem('listaComprados') || '[]');
    purchasedItems.push(item);
    localStorage.setItem('listaComprados', JSON.stringify(purchasedItems));

    this.itemsByCategory[typedCategory].splice(index, 1);
    this.saveItems();
    this.loadItems();

    this.buyItemComponent.loadPurchasedItems();
    this.notifyByuItem.emit();
  }

  saveItems(): void {
    localStorage.setItem('itensCategory', JSON.stringify(this.itemsByCategory));

  }

  categoriaPT(category: string): string {
    switch (category) {
      case 'cold':
        return 'frios';
      case 'perishables':
        return 'perecíveis';
      case 'cleaning':
        return 'limpeza';
      case 'others':
        return 'outros';
      default:
        return category
    }
  }

  clearList(): void {
    localStorage.removeItem('listaCompras');
    this.items = [];
  }

  get objectKeys() {
    return Object.keys;
  }

  getItemsByCategory(category: keyof typeof this.itemsByCategory): Item[] {
    return this.itemsByCategory[category] || [];
  }



  onNotifyAddItem(): void {
    this.notifyAddItem.emit()

  }

  onNotifyUpdatedItem(): void {
    this.notifyUpdatedItem.emit()
  }

  removeItemBuy(): void {
    this.notifyRemoveItem.emit()
  }


  clearListBuy(): void {
    localStorage.removeItem('listaComprados');
  }

  scrollToTop(): void {
    const scrollDuration = 30; // Tempo total em ms
    const startPosition = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / scrollDuration, 1);
      const scrollPosition = startPosition * (1 - progress);

      window.scrollTo(0, scrollPosition);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

}
