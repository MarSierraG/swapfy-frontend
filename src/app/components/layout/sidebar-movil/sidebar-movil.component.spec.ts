import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarMovilComponent } from './sidebar-movil.component';

describe('SidebarMovilComponent', () => {
  let component: SidebarMovilComponent;
  let fixture: ComponentFixture<SidebarMovilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarMovilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarMovilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
