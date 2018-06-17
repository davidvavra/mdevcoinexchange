import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashOutsComponent } from './cash-outs.component';

describe('CashOutsComponent', () => {
  let component: CashOutsComponent;
  let fixture: ComponentFixture<CashOutsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashOutsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashOutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
