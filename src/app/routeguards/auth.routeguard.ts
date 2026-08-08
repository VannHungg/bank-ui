import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    UrlTree
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
    ): Promise<boolean | UrlTree> {

        if (!this.authenticated) {
            await this.keycloak.login({
                redirectUri: window.location.origin + state.url,
            });
            return false;
        }

        if (!window.sessionStorage.getItem("userdetails")) {
            try {
                this.userProfile = await this.keycloak.loadUserProfile();
                this.user.authStatus = 'AUTH';
                this.user.name = this.userProfile.firstName || "";
                this.user.email = this.userProfile.username || "";
                window.sessionStorage.setItem("userdetails", JSON.stringify(this.user));
            } catch (error) {
                console.error('Error occurred while loading user profile:', error);
                return false;
            }
        }

        const requiredRoles = route.data["roles"];
        if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
            return true;
        }

        return requiredRoles.some((role) => this.roles.includes(role));
    }
}