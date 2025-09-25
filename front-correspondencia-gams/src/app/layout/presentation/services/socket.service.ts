import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Communication } from '../../../communications/domain';
import { IUserSocket } from '../../infrastructure';
import {
  communication,
  CommunicationMapper,
} from '../../../communications/infrastructure';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private onlineClientsSubject = new BehaviorSubject<IUserSocket[]>([]);

  onlineClients$ = this.onlineClientsSubject.asObservable();

  connect():void {
    this.socket = io(environment.socket_url, {
      auth: { token: localStorage.getItem('token') },
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }

  listenUserConnections(): void {
    this.socket.on('clientsList', (users: IUserSocket[]) => {
      this.onlineClientsSubject.next(users);
    });
  }

  listenNewCommunications(): Observable<Communication> {
    return new Observable((observable) => {
      this.socket.on('new-communication', (data: communication) => {
        observable.next(CommunicationMapper.fromResponse(data));
      });
    });
  }

  listenCancelCommunications(): Observable<string> {
    return new Observable((observable) => {
      this.socket.on('cancel-communication', (communicationId: string) => {
        observable.next(communicationId);
      });
    });
  }
listen<T = any>(event: string): Observable<T> {
  return new Observable<T>((observer) => {
    this.socket.on(event, (data: T) => {
      observer.next(data);
    });
  });
}


  get currentOnlineUsers() {
    return this.onlineClientsSubject.getValue();
  }
}
