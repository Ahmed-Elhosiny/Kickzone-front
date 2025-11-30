import { Component } from '@angular/core';
import { Header } from '../header/header';

@Component({
  selector: 'app-Home',
  imports: [Header],
  templateUrl: './Home.html',
  styleUrls: ['./Home.css'],
})
export class Home {
  missionImage: string = '/images/mission.jpg';
  vissionImage: string = '/images/vission.jpg';
}
