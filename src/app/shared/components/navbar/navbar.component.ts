import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  user = this.supabaseService.user;

  getUserInitial(): string {
    const u = this.user();
    if (u?.displayName) return u.displayName.charAt(0).toUpperCase();
    if (u?.email) return u.email.charAt(0).toUpperCase();
    return 'U';
  }

  getUserName(): string {
    const u = this.user();
    if (u?.displayName) return u.displayName;
    if (u?.email) return u.email.split('@')[0];
    return 'User';
  }

  async logout() {
    await this.supabaseService.logout();
    this.router.navigate(['/login']);
  }
}
