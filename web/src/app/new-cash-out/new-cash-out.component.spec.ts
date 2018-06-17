import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCashOutComponent } from './new-cash-out.component';

describe('NewCashOutComponent', () => {
  let component: NewCashOutComponent;
  let fixture: ComponentFixture<NewCashOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCashOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCashOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
