import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection?: signalR.HubConnection;

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/SlotsReservationHub`,{withCredentials: true}) // your API url
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
    .then(() => console.log('SignalR connected'))
    .catch(err => console.error('SignalR error:', err));
  }

  onSlotsUpdated(callback: () => void) {
    this.hubConnection?.on('SlotsUpdated', callback);
  }
   stopConnection() {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }

}



/* export class SlotsComponent implements OnInit {

  slots: any[] = [];

  constructor(private signalrService: SignalrService ,private slotsService: SlotsService) {}

  ngOnInit() {
    // Connect to real-time hub
    this.signalrService.startConnection();

    // Load slots first time
    this.load();

    // Listen for updates
    this.signalrService.onSlotsUpdated(() => {
      this.load(); // reload slots when someone books
    });
  }

  load() {
    this.slotsService.loadSlots().subscribe(data => {
      this.slots = data;
    });
  }
} */

