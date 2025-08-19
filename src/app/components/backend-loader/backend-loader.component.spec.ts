import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendLoaderComponent } from './backend-loader.component';

describe('BackendLoaderComponent', () => {
  let component: BackendLoaderComponent;
  let fixture: ComponentFixture<BackendLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackendLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackendLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
