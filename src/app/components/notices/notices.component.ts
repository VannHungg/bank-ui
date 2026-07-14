import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
    selector: 'app-notices',
    templateUrl: './notices.component.html',
    styleUrls: ['./notices.component.css'],
})
export class NoticesComponent implements OnInit {
    notices: any[] = [];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.dashboardService.getNoticeDetails().subscribe({
            next: (responseData) => {
                const body = responseData.body as any;
                this.notices = Array.isArray(body?.result) ? body.result : [];
            },
            error: (err) => {
                console.error('Failed to load notices', err);
                this.notices = [];
            },
        });
    }
}
