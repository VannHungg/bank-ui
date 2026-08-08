import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { User } from '../model/user.model';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
    providedIn: 'root',
})
export class AuthKeyClockGuard extends KeycloakAuthGuard {
    user = new User();
    public userProfile: KeycloakProfile | null = null;

    constructor(
        protected override readonly router: Router,
        protected readonly keycloak: KeycloakService
    ) {
        super(router, keycloak);
    }

    public async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        if (!this.authenticated) {
            await this.keycloak.login({
                redirectUri: window.location.origin + state.url,
            });
        }
        else {
            try {
                this.userProfile = await this.keycloak.loadUserProfile();
                this.user.authStatus = 'AUTH';
                this.user.name = this.userProfile.firstName || this.userProfile.username || "";
                this.user.email = this.userProfile.email || "";
                window.sessionStorage.setItem("userdetails", JSON.stringify(this.user));
            }
            catch (error) {
                console.error('Error occurred while checking access:', error);
            }
        }

        const requiredRoles = route.data["roles"];
        if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
            return true;
        }

        return requiredRoles.some((role) => this.roles.includes(role));
    }
}