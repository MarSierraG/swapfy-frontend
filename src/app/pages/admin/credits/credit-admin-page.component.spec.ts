import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditAdminPageComponent } from './credit-admin-page.component';

describe('CreditAdminPageComponent', () => {
  let component: CreditAdminPageComponent;
  let fixture: ComponentFixture<CreditAdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditAdminPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
