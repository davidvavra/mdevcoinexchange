import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinsOwnedByAttendeesComponent } from './coins-owned-by-attendees.component';

describe('CoinsOnMarketComponent', () => {
  let component: CoinsOwnedByAttendeesComponent;
  let fixture: ComponentFixture<CoinsOwnedByAttendeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinsOwnedByAttendeesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsOwnedByAttendeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
