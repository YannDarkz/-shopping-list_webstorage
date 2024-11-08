import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { Iproduct } from '../../interfaces/item-list';

@Component({
  selector: 'app-add-items',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-items.component.html',
  styleUrl: './add-items.component.scss'
})
export class AddItemsComponent {

  @Output() itemUpdated = new EventEmitter<void>()
  @Output() notifyAddItem = new EventEmitter<void>()
  @Output() notifyEditItem = new EventEmitter<void>()

  itemsByCategory = {
    cold: [] as Iproduct[],
    perishables: [] as Iproduct[],
    cleaning: [] as Iproduct[],
    others: [] as Iproduct[]
  };

  currentItemCategory: keyof typeof this.itemsByCategory | null = null;
  currentItemIndex: number | null = null

  addItemForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: [null, [Validators.required, Validators.min(0)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    category: ['', Validators.required]
  });

  editing: boolean = false

  constructor(private formBuilder: FormBuilder) { }

  addItem(): void {
    if (this.addItemForm.valid) {
      let newItem = this.addItemForm.value;
      let currentList = JSON.parse(localStorage.getItem('itensCategory') || '{}');

      const category = newItem.category?.toLowerCase();

      if (this.editing && this.currentItemIndex !== null) {
        if (this.currentItemCategory && this.currentItemCategory !== category) {
          currentList[this.currentItemCategory].splice(this.currentItemIndex, 1);
        }
        if (category) {
          if (!currentList[category]) {
            currentList[category] = [];
          }

          if (this.currentItemCategory === category) {
            currentList[category][this.currentItemIndex] = newItem;
          } else {
            currentList[category].push(newItem);
          }
        }
      } else if(category) {
        if (!currentList[category]) {
          currentList[category] = [];
        }
        currentList[category].push(newItem);
      }


      localStorage.setItem('itensCategory', JSON.stringify(currentList));

      if (this.editing) {
        this.notifyEditItem.emit();
      } else {
        this.notifyAddItem.emit();
      }

      this.itemUpdated.emit();

      this.addItemForm.reset();
      this.editing = false;
      this.currentItemIndex = null;
      this.currentItemCategory = null;


    }
  }

  startEdit(item: any, category: keyof typeof this.itemsByCategory, index: number): void {
    this.addItemForm.patchValue(item);
    this.editing = true;
    this.currentItemCategory = category;
    this.currentItemIndex = index;
  }

  cancelEdit() {
    this.addItemForm.reset();
    this.editing = false;
    this.currentItemIndex = null;
    this.currentItemCategory = null;
  }

  get itemName() {
    return this.addItemForm.get('name')!;
  }

  get itemPrice() {
    return this.addItemForm.get('price')!;
  }

  get itemQuantity() {
    return this.addItemForm.get('quantity')!;
  }

  get itemCategory() {
    return this.addItemForm.get('category')!;
  }

}
