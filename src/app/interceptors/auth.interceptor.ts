import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    return from(this.auth.getToken()).pipe(
      switchMap(token => {

        const headers: any = {
          'X-API-KEY': environment.apiKey
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        return next.handle(req.clone({ setHeaders: headers }));

      })
    );

  }

}
