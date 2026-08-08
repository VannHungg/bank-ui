import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { User } from 'src/app/model/user.model';
import { LoginService } from 'src/app/services/login/login.service';
import { getCookie } from 'typescript-cookie';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent {
    authStatus: string = '';
    model = new User();

    constructor(
        private loginService: LoginService,
        private router: Router,
        private route: ActivatedRoute,
        private keycloak: KeycloakService
    ) {}

    login(): void {
        this.keycloak.login({
            redirectUri: window.location.origin + '/dashboard'
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
}
