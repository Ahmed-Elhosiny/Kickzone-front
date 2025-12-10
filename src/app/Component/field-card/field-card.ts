import { Component, input } from '@angular/core';
import { IField } from '../../Model/IField/ifield';
import { RouterLink } from "@angular/router";


@Component({
  selector: 'app-field-card',
  imports: [RouterLink],
  templateUrl: './field-card.html',
  styleUrl: './field-card.css',
})
export class FieldCard {
  field = input<IField>();
  defaultImage: string = '';
}
