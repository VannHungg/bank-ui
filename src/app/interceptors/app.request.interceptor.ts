import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User } from 'src/app/model/user.model';

@Injectable()
export class XhrInterceptor implements HttpInterceptor {
    user = new User();
    constructor(private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        let httpHeaders = new HttpHeaders();

        let token = sessionStorage.getItem('XSRF-TOKEN');
        if (token) {
            httpHeaders = httpHeaders.append('X-XSRF-TOKEN', token);
        }

        let jwtToken = sessionStorage.getItem('Authorization');
        if (jwtToken) {
            httpHeaders = httpHeaders.set('Authorization', jwtToken);
        } 
        else {
            if (sessionStorage.getItem('userdetails')) {
                const user: User = JSON.parse(sessionStorage.getItem('userdetails')!);
                if (user && user.email && user.password) {
                    httpHeaders = httpHeaders.set(
                        'Authorization',
                        'Basic ' + window.btoa(user.email + ':' + user.password)
                    );
                }
            }
        }
        
        httpHeaders = httpHeaders.append('X-Requested-With', 'XMLHttpRequest');
        const xhr = req.clone({
            headers: httpHeaders,
        });
        return next.handle(xhr).pipe(
            tap((err: any) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status !== 401) {
                        return;
                    }
                    this.router.navigate(['login']);
                }
            }),
        );
    }
}
