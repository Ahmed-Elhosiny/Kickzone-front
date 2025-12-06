import { Component, input } from '@angular/core';
import { IField } from '../../Model/IField/ifield';


@Component({
  selector: 'app-field-card',
  imports: [],
  templateUrl: './field-card.html',
  styleUrl: './field-card.css',
})
export class FieldCard {
  field = input<IField>();
  defaultImage: string = '';
}
