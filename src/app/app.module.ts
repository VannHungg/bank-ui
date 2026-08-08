import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    HttpClientModule,
    HTTP_INTERCEPTORS,
    HttpClientXsrfModule,
} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NoticesComponent } from './components/notices/notices.component';
import { AccountComponent } from './components/account/account.component';
import { BalanceComponent } from './components/balance/balance.component';
import { LoansComponent } from './components/loans/loans.component';
import { CardsComponent } from './components/cards/cards.component';
import { AuthKeyClockGuard } from './routeguards/auth.routeguard';
import { HomeComponent } from './components/home/home.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

function initializeKeycloak(keycloak: KeycloakService) {
    return async () => {
        try {
            const result = await keycloak.init({
                config: {
                    url: 'http://localhost:8181',
                    realm: 'bank-client',
                    clientId: 'bankpcke',
                },
                initOptions: {
                    responseMode: 'query',
                    flow: 'standard',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                },
                enableBearerInterceptor: true,
                bearerExcludedUrls: ['/assets'],
                loadUserProfileAtStartUp: false
            });

            console.log('KEYCLOAK INIT RESULT:', result);
            console.log('KEYCLOAK AUTHENTICATED:', keycloak.isLoggedIn());

            return result;

        } catch (error) {
            console.error('🔥 KEYCLOAK INIT FAILED');
            console.error('error:', error);
            console.error('type:', typeof error);
            console.error('stringified:', JSON.stringify(error));

            throw error;
        }
    };
}

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        ContactComponent,
        LoginComponent,
        DashboardComponent,
        LogoutComponent,
        NoticesComponent,
        AccountComponent,
        BalanceComponent,
        LoansComponent,
        CardsComponent,
        HomeComponent,
    ],
    imports: [
        BrowserModule,
        KeycloakAngularModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'XSRF-TOKEN',
            headerName: 'X-XSRF-TOKEN',
        }),
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            multi: true,
            deps: [KeycloakService],
        },
        AuthKeyClockGuard
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
