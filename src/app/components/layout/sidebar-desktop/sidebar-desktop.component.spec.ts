import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarDesktopComponent } from './sidebar-desktop.component';

describe('SidebarDesktopComponent', () => {
  let component: SidebarDesktopComponent;
  let fixture: ComponentFixture<SidebarDesktopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarDesktopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
