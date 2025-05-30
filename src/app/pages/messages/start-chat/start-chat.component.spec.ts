import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartChatComponent } from './start-chat.component';

describe('StartChatComponent', () => {
  let component: StartChatComponent;
  let fixture: ComponentFixture<StartChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
