import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user.model';
import { NgForm } from '@angular/forms';
import { LoginService } from 'src/app/services/login/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getCookie } from 'typescript-cookie';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    authStatus: string = '';
    model = new User();

    constructor(
        private loginService: LoginService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const token = params['token'];
            if (token) {
                window.sessionStorage.setItem('Authorization', token);
                this.fetchUserDetailsAfterOAuth();
            }
        });
    }

    fetchUserDetailsAfterOAuth() {
        this.loginService.getUserDetails().subscribe((responseData) => {
            const body = responseData.body as any;
            this.model = body?.result;
            this.model.authStatus = 'AUTH';

            window.sessionStorage.setItem(
                'userdetails',
                JSON.stringify(this.model),
            );

            let xsrfToken = getCookie('XSRF-TOKEN');
            if (xsrfToken) {
                window.sessionStorage.setItem('XSRF-TOKEN', xsrfToken);
            }
            
            this.router.navigate(['dashboard'], { replaceUrl: true });
        });
    }

    validateUser(loginForm: NgForm) {
        this.loginService
            .validateLoginDetails(this.model)
            .subscribe((responseData) => {
                const body = responseData.body as any;
                this.model = body?.result;
                this.model.authStatus = 'AUTH';
                let token = getCookie('XSRF-TOKEN');

                window.sessionStorage.setItem(
                    'userdetails',
                    JSON.stringify(this.model),
                );
                window.sessionStorage.setItem('XSRF-TOKEN', token!);
                window.sessionStorage.setItem(
                    'Authorization',
                    responseData.headers.get('Authorization')!,
                );

                this.router.navigate(['dashboard']);
            });
    }

    loginWithGithub(): void {
        window.location.href = `${environment.rooturl}/oauth2/authorization/github`;
    }
}
