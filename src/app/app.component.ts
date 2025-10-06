import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule],
  providers: [provideAnimations()],
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }
    `,
  ],
  template: `
    <mat-toolbar color="primary">
      <span
        class="mat-title-medium"
        style="display:flex;align-items:center;gap:8px;"
      >
        <mat-icon>article</mat-icon> HoBom Tech Blog
      </span>
      <span class="spacer"></span>
      <button mat-icon-button (click)="toggleTheme()" aria-label="toggle theme">
        <mat-icon>{{ theme === "dark" ? "light_mode" : "dark_mode" }}</mat-icon>
      </button>
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  theme: "light" | "dark" = (localStorage.getItem("theme") as any) || "light";
  ngOnInit() {
    document.documentElement.classList.toggle("dark", this.theme === "dark");
  }
  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", this.theme);
    document.documentElement.classList.toggle("dark", this.theme === "dark");
  }
}
